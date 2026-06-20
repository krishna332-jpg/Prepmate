import { useState, useEffect, useRef } from 'react';
import { transcribeAudio, evaluateAnswer } from '../utils/claude';

export function Interview({ company, role, questions, qIndex, chatLog, aiThinking, onAutoSubmit, onRepeat, onFinish, aiVoice }) {
  const [currentQ,   setCurrentQ]   = useState(0);
  const [mode,       setMode]       = useState('voice'); // voice | text
  const [done,       setDone]       = useState(false);
  const [ratings,    setRatings]    = useState({});

  // Speech (AI asking the question)
  const [aiSpeaking, setAiSpeaking] = useState(false);

  // Voice recording state
  const [recording,  setRecording]  = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback,   setFeedback]   = useState(null);
  const [volBars,    setVolBars]    = useState(Array(28).fill(4));
  const [recError,   setRecError]   = useState('');
  const [elapsed,    setElapsed]    = useState(0);
  const [audioURL,   setAudioURL]   = useState(null);

  // Text state
  const [textAns,    setTextAns]    = useState('');
  const [textFb,     setTextFb]     = useState(null);
  const [textLoading,setTextLoading]= useState(false);

  const mediaRecRef  = useRef(null);
  const streamRef    = useRef(null);
  const chunksRef    = useRef([]);
  const animRef      = useRef(null);
  const timerRef     = useRef(null);
  const audioCtxRef  = useRef(null);
  const cleanedRef   = useRef(true);

  // Panel is open whenever there's feedback to show (voice or text mode), or mid-closing animation
  const [closing, setClosing] = useState(false);
  const hasFeedback = (mode === 'voice' && !!feedback) || (mode === 'text' && !!textFb);
  const showPanel = hasFeedback || closing;
  const lastFbRef = useRef(null);
  if (hasFeedback) lastFbRef.current = mode === 'voice' ? feedback : textFb;
  const closePanel = () => {
    setClosing(true);
    setTimeout(() => setClosing(false), 360);
  };

  const qs    = questions.length ? questions : [];
  const q     = qs[currentQ];
  const total = qs.length;
  const pct   = total ? Math.round((currentQ / total) * 100) : 0;

  // ── Speak the question out loud whenever it changes (voice mode only) ──
  useEffect(() => {
    setTranscript(''); setFeedback(null);
    setTextAns(''); setTextFb(null); setRecError(''); setElapsed(0); setAudioURL(null);

    if (mode === 'voice' && q) {
      speakQuestion(q.question || q);
    }
    return () => { window.speechSynthesis.cancel(); };
  }, [currentQ, mode]);

  useEffect(() => () => { stopAll(); window.speechSynthesis.cancel(); }, []);

  const speakQuestion = (text) => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.98;
    utter.pitch = aiVoice === 'male' ? 0.9 : 1.05;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => aiVoice === 'male' ? /male|david|mark/i.test(v.name) : /female|zira|samantha|susan/i.test(v.name));
    if (preferred) utter.voice = preferred;
    utter.onstart = () => setAiSpeaking(true);
    utter.onend   = () => setAiSpeaking(false);
    utter.onerror = () => setAiSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const replayQuestion = () => { if (q) speakQuestion(q.question || q); };

  const stopAll = () => {
    if (cleanedRef.current) return;
    cleanedRef.current = true;
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      audioCtxRef.current = null;
      if (ctx.state !== 'closed') { try { ctx.close(); } catch(e) {} }
    }
    setRecording(false);
    setVolBars(Array(28).fill(4));
    setElapsed(0);
  };

  const startRecording = async () => {
    setRecError(''); setTranscript(''); setFeedback(null); setAudioURL(null);
    cleanedRef.current = false;

    if (!navigator.mediaDevices?.getUserMedia) {
      setRecError('Your browser does not support audio recording. Use Chrome or Edge.');
      cleanedRef.current = true;
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      src.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(buf);
        const bars = Array.from({ length: 28 }, (_, i) =>
          Math.max(4, (buf[Math.floor(i * buf.length / 28)] / 255) * 52)
        );
        setVolBars(bars);
        animRef.current = requestAnimationFrame(tick);
      };
      tick();

      let secs = 0;
      timerRef.current = setInterval(() => { secs++; setElapsed(secs); }, 1000);

      chunksRef.current = [];
      const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      const mimeType = candidates.find(t => MediaRecorder.isTypeSupported(t)) || '';
      const rec = mimeType ? new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 128000 }) : new MediaRecorder(stream);
      const actualType = rec.mimeType || mimeType || 'audio/webm';

      rec.ondataavailable = e => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        stopAll();
        const blob = new Blob(chunksRef.current, { type: actualType });
        setAudioURL(URL.createObjectURL(blob));
        if (blob.size < 3000) { setRecError('Recording too short or empty. Check your microphone and try again — speak for at least 3 seconds.'); setProcessing(false); return; }
        setProcessing(true);
        const text = await transcribeAudio(blob);
        setProcessing(false);
        if (!text) { setRecError('Could not transcribe audio. Check your Groq API key, or use Text mode below.'); return; }
        setTranscript(text);
      };
      rec.start(250);
      mediaRecRef.current = rec;
      setRecording(true);

    } catch(err) {
      cleanedRef.current = true;
      if (err.name === 'NotAllowedError') setRecError('Microphone access denied. Click the lock icon in your browser address bar → allow Microphone → refresh.');
      else if (err.name === 'NotFoundError') setRecError('No microphone found. Connect a microphone or use Text mode below.');
      else setRecError(`Microphone error: ${err.message}. Use Text mode below.`);
    }
  };

  const stopRecording = () => {
    if (mediaRecRef.current?.state === 'recording') mediaRecRef.current.stop();
    else stopAll();
  };

  const submitVoiceAnswer = async () => {
    if (!transcript.trim()) return;
    const questionText = q?.question || q;
    setProcessing(true);
    const fb = await evaluateAnswer(questionText, transcript, company?.name, role);
    setFeedback(fb);
    setProcessing(false);
  };

  const submitTextAnswer = async () => {
    if (!textAns.trim() || textLoading) return;
    const questionText = q?.question || q;
    setTextLoading(true);
    const fb = await evaluateAnswer(questionText, textAns, company?.name, role);
    setTextFb(fb);
    setTextLoading(false);
  };

  const nextQuestion = () => {
    if (currentQ < total - 1) setCurrentQ(i => i + 1);
    else setDone(true);
  };

  const fmt = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  // ── Done screen ──
  if (done) {
    const fbList = qs.map((_, i) => ratings[i]).filter(Boolean);
    return (
      <div style={{ maxWidth:'600px', margin:'0 auto', padding:'clamp(32px,6vh,80px) clamp(16px,4vw,32px)', textAlign:'center' }}>
        <div style={{ fontSize:'11px', color:'#333', letterSpacing:'0.1em', fontFamily:'JetBrains Mono,monospace', marginBottom:'16px' }}>SESSION COMPLETE</div>
        <h2 style={{ fontSize:'clamp(28px,5vw,48px)', fontWeight:700, color:'#fff', letterSpacing:'-0.03em', margin:'0 0 32px' }}>Good work — {total} questions done.</h2>
        <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={onFinish}
            style={{ padding:'11px 28px', borderRadius:'8px', border:'none', background:'#fff', color:'#000', fontSize:'13px', fontWeight:600, fontFamily:'Inter,sans-serif', cursor:'pointer' }}>
            View Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:'1180px', margin:'0 auto', padding:'clamp(24px,4vh,52px) clamp(8px,2vw,20px)', overflow:'hidden' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'10px', maxWidth:'780px', marginLeft:'auto', marginRight:'auto' }}>
        <div>
          <div style={{ fontSize:'10px', color:'#333', letterSpacing:'0.1em', fontFamily:'JetBrains Mono,monospace', marginBottom:'3px' }}>PRACTICE SESSION</div>
          <div style={{ fontSize:'15px', color:'#666' }}>{company?.name} — {role}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:'11px', color:'#333', fontFamily:'JetBrains Mono,monospace' }}>{currentQ+1} / {total}</div>
            <div style={{ height:'2px', width:'80px', background:'#111', borderRadius:'1px', marginTop:'4px' }}>
              <div style={{ height:'100%', background:'#fff', width:`${pct}%`, borderRadius:'1px', transition:'width 0.4s ease' }}/>
            </div>
          </div>
          <button onClick={onFinish} style={{ padding:'6px 12px', borderRadius:'6px', border:'1px solid rgba(255,255,255,0.07)', background:'transparent', color:'#444', fontSize:'12px', fontFamily:'Inter,sans-serif', cursor:'pointer' }}>End</button>
        </div>
      </div>

      {/* Mode tabs */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', background:'#0a0a0a', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'8px', padding:'4px', width:'fit-content', maxWidth:'780px', marginLeft: showPanel ? '0' : 'auto', marginRight: showPanel ? '0' : 'auto', transition:'margin 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
        {[['voice','Voice'],['text','Text']].map(([m,label])=>(
          <button key={m} onClick={()=>{ setMode(m); setFeedback(null); setTranscript(''); setTextFb(null); setTextAns(''); setRecError(''); setAudioURL(null); stopAll(); window.speechSynthesis.cancel(); }}
            style={{ padding:'7px 18px', borderRadius:'6px', border:'none', cursor:'pointer', fontFamily:'Inter,sans-serif', fontSize:'12px', fontWeight:500, transition:'all 0.15s',
              background: mode===m?'#fff':'transparent', color: mode===m?'#000':'#444' }}>
            {label}
          </button>
        ))}
      </div>

      {/* TWO PANEL LAYOUT */}
      <div style={{ display:'flex', gap:'16px', justifyContent: showPanel ? 'flex-start' : 'center', transition:'justify-content 0.5s ease' }}>

        {/* LEFT — main question/recording box, slides left when panel opens */}
        <div style={{
          width: showPanel ? 'calc(50% - 8px)' : '780px',
          maxWidth: showPanel ? '560px' : '780px',
          flexShrink: 0,
          transition:'width 0.5s cubic-bezier(0.16,1,0.3,1), max-width 0.5s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <div style={{ border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', background:'#080808', overflow:'hidden', marginBottom:'16px' }}>
            {q && (
              <div style={{ padding:'clamp(20px,3vw,32px)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px', flexWrap:'wrap', gap:'8px' }}>
                  <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
                    {q.type && <span style={{ fontSize:'10px', padding:'3px 10px', borderRadius:'4px', border:'1px solid rgba(255,255,255,0.08)', color:'#444', fontFamily:'JetBrains Mono,monospace' }}>{q.type.toUpperCase()}</span>}
                    {q.difficulty && <span style={{ fontSize:'10px', padding:'3px 10px', borderRadius:'4px', border:'1px solid rgba(255,255,255,0.08)', color: q.difficulty==='hard'?'#888':q.difficulty==='medium'?'#666':'#444', fontFamily:'JetBrains Mono,monospace' }}>{q.difficulty.toUpperCase()}</span>}
                    {mode === 'voice' && (
                      <button onClick={replayQuestion} disabled={aiSpeaking} style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'10px', padding:'3px 10px', borderRadius:'4px', border:'1px solid rgba(255,255,255,0.08)', background:'transparent', color: aiSpeaking?'#fff':'#444', fontFamily:'JetBrains Mono,monospace', cursor: aiSpeaking?'default':'pointer' }}>
                        {aiSpeaking ? 'SPEAKING' : 'REPLAY'}
                      </button>
                    )}
                  </div>
                  <button onClick={nextQuestion} style={{ fontSize:'11px', color:'#333', background:'transparent', border:'none', cursor:'pointer', fontFamily:'JetBrains Mono,monospace' }}>skip</button>
                </div>
                <p style={{ fontSize:'clamp(15px,2.2vw,22px)', color:'#ededed', lineHeight:1.65, fontFamily:'Inter,sans-serif', fontWeight:400, margin:0, letterSpacing:'-0.01em' }}>
                  {q.question || q}
                </p>
              </div>
            )}

            {/* ── VOICE mode body ── */}
            {mode === 'voice' && (
              <div style={{ padding:'0 clamp(16px,2.5vw,28px) clamp(16px,2.5vw,28px)' }}>
                {recording && (
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px', padding:'12px 16px', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', background:'#0a0a0a' }}>
                    <span style={{ fontSize:'10px', color:'#fff', fontFamily:'JetBrains Mono,monospace', flexShrink:0 }}>REC {fmt(elapsed)}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:'2px', flex:1, height:'32px' }}>
                      {volBars.map((h,i)=>(
                        <div key={i} style={{ flex:1, borderRadius:'1px', background:'#fff', height:`${Math.max(3,h*0.6)}px`, maxHeight:'32px', opacity:0.7, transition:'height 0.06s ease' }}/>
                      ))}
                    </div>
                  </div>
                )}

                {audioURL && !recording && (
                  <div style={{ marginBottom:'14px' }}>
                    <div style={{ fontSize:'10px', color:'#333', fontFamily:'JetBrains Mono,monospace', marginBottom:'6px' }}>PLAYBACK</div>
                    <audio controls src={audioURL} style={{ width:'100%', height:'34px' }}/>
                  </div>
                )}

                {transcript && !recording && (
                  <div style={{ padding:'14px 16px', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', background:'#0a0a0a', marginBottom:'14px', animation:'fadeIn 0.2s ease' }}>
                    <div style={{ fontSize:'10px', color:'#333', fontFamily:'JetBrains Mono,monospace', marginBottom:'6px' }}>YOUR ANSWER (transcribed)</div>
                    <p style={{ fontSize:'14px', color:'#ededed', margin:0, lineHeight:1.7 }}>{transcript}</p>
                  </div>
                )}

                {recError && (
                  <div style={{ padding:'10px 14px', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'7px', color:'#666', fontSize:'12px', marginBottom:'12px', lineHeight:1.6 }}>
                    {recError}
                  </div>
                )}

                {processing && (
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#444', fontSize:'13px', fontFamily:'JetBrains Mono,monospace', marginBottom:'12px' }}>
                    <Dots/> {transcript ? 'Analysing your answer...' : 'Transcribing audio...'}
                  </div>
                )}
              </div>
            )}

            {/* ── TEXT mode body ── */}
            {mode === 'text' && !textFb && (
              <div style={{ padding:'0 clamp(16px,2.5vw,24px) clamp(16px,2.5vw,24px)' }}>
                <textarea value={textAns} onChange={e=>setTextAns(e.target.value)}
                  placeholder="Type your answer here..." rows={5}
                  onKeyDown={e=>{ if(e.key==='Enter'&&e.ctrlKey) submitTextAnswer(); }}
                  style={{ width:'100%', background:'#0a0a0a', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'14px', color:'#ededed', fontSize:'14px', fontFamily:'Inter,sans-serif', lineHeight:1.7, resize:'vertical', outline:'none', boxSizing:'border-box' }}
                  onFocus={e=>e.target.style.borderColor='rgba(255,255,255,0.2)'}
                  onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.08)'}
                  autoFocus
                />
                <div style={{ display:'flex', gap:'8px', marginTop:'10px', alignItems:'center' }}>
                  <button onClick={submitTextAnswer} disabled={!textAns.trim()||textLoading}
                    style={{ padding:'9px 22px', borderRadius:'7px', border:'none', background:'#fff', color:'#000', fontSize:'13px', fontWeight:600, fontFamily:'Inter,sans-serif', cursor: textAns.trim()&&!textLoading?'pointer':'not-allowed', opacity: textAns.trim()&&!textLoading?1:0.3 }}>
                    {textLoading ? 'Checking...' : 'Submit'}
                  </button>
                  <span style={{ fontSize:'11px', color:'#333', fontFamily:'JetBrains Mono,monospace' }}>Ctrl+Enter</span>
                </div>
              </div>
            )}
          </div>

          {/* Voice action buttons */}
          {mode === 'voice' && !feedback && (
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center' }}>
              {!recording && !processing && !transcript && (
                <button onClick={startRecording} disabled={aiSpeaking}
                  style={{ display:'flex', alignItems:'center', gap:'8px', padding:'11px 24px', borderRadius:'8px', border:'none', background:'#fff', color:'#000', fontSize:'13px', fontWeight:600, fontFamily:'Inter,sans-serif', cursor: aiSpeaking?'not-allowed':'pointer', opacity: aiSpeaking?0.3:1 }}>
                  <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#e00', display:'inline-block' }}/>
                  Start Recording
                </button>
              )}
              {recording && (
                <button onClick={stopRecording}
                  style={{ display:'flex', alignItems:'center', gap:'8px', padding:'11px 24px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff', fontSize:'13px', fontFamily:'Inter,sans-serif', cursor:'pointer' }}>
                  <span style={{ width:'8px', height:'8px', borderRadius:'2px', background:'#fff', display:'inline-block' }}/>
                  Stop Recording
                </button>
              )}
              {transcript && !recording && !processing && (
                <>
                  <button onClick={submitVoiceAnswer}
                    style={{ padding:'11px 24px', borderRadius:'8px', border:'none', background:'#fff', color:'#000', fontSize:'13px', fontWeight:600, fontFamily:'Inter,sans-serif', cursor:'pointer' }}>
                    Analyse Answer
                  </button>
                  <button onClick={()=>{ setTranscript(''); setRecError(''); setAudioURL(null); }}
                    style={{ padding:'11px 18px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.08)', background:'transparent', color:'#555', fontSize:'13px', fontFamily:'Inter,sans-serif', cursor:'pointer' }}>
                    Re-record
                  </button>
                </>
              )}
            </div>
          )}

          {mode === 'voice' && feedback && (
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              <button onClick={()=>{ closePanel(); setTimeout(()=>{ setFeedback(null); setTranscript(''); setAudioURL(null); nextQuestion(); }, 350); }}
                style={{ padding:'11px 28px', borderRadius:'8px', border:'none', background:'#fff', color:'#000', fontSize:'13px', fontWeight:600, fontFamily:'Inter,sans-serif', cursor:'pointer' }}>
                Next Question
              </button>
              <button onClick={()=>{ closePanel(); setTimeout(()=>{ setFeedback(null); setTranscript(''); setAudioURL(null); }, 350); }}
                style={{ padding:'11px 20px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.08)', background:'transparent', color:'#555', fontSize:'13px', fontFamily:'Inter,sans-serif', cursor:'pointer' }}>
                Try Again
              </button>
            </div>
          )}

          {mode === 'text' && textFb && (
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              <button onClick={()=>{ closePanel(); setTimeout(()=>{ setTextFb(null); setTextAns(''); nextQuestion(); }, 350); }}
                style={{ padding:'11px 28px', borderRadius:'8px', border:'none', background:'#fff', color:'#000', fontSize:'13px', fontWeight:600, fontFamily:'Inter,sans-serif', cursor:'pointer' }}>
                Next Question
              </button>
              <button onClick={()=>{ closePanel(); setTimeout(()=>{ setTextFb(null); setTextAns(''); }, 350); }}
                style={{ padding:'11px 20px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.08)', background:'transparent', color:'#555', fontSize:'13px', fontFamily:'Inter,sans-serif', cursor:'pointer' }}>
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* RIGHT — analysis panel, slides in from the right, slides out on close */}
        {showPanel && (
          <div style={{
            width:'calc(50% - 8px)', maxWidth:'560px', flexShrink:0,
            animation: closing ? 'slideOutRight 0.36s cubic-bezier(0.16,1,0.3,1) both' : 'slideInRight 0.5s cubic-bezier(0.16,1,0.3,1) both',
          }}>
            <div style={{ border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', background:'#080808', padding:'clamp(20px,3vw,28px)' }}>
              <div style={{ fontSize:'10px', color:'#333', letterSpacing:'0.1em', fontFamily:'JetBrains Mono,monospace', marginBottom:'16px' }}>ANSWER ANALYSIS</div>
              <FeedbackBlock fb={lastFbRef.current}/>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes slideInRight  { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideOutRight { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(40px)} }
        textarea::placeholder { color:#333 !important }
      `}</style>
    </div>
  );
}

function Dots() {
  return (
    <div style={{ display:'flex', gap:'4px' }}>
      {[0,1,2].map(i=><div key={i} style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#444', animation:`bounce 1.2s ${i*0.18}s infinite` }}/>)}
    </div>
  );
}

function FeedbackBlock({ fb }) {
  if (!fb) return null;
  return (
    <div>
      <div style={{ display:'flex', gap:'10px', marginBottom:'12px', flexWrap:'wrap' }}>
        {[
          { l:'Score',      v:`${fb.score}/10`,      c: fb.score>=7?'#fff':fb.score>=5?'#888':'#555' },
          { l:'Confidence', v: fb.confidence,        c:'#888' },
          { l:'Fillers',    v:`${fb.filler_count}x`, c:'#666' },
        ].map(({l,v,c})=>(
          <div key={l} style={{ padding:'10px 14px', borderRadius:'7px', border:'1px solid rgba(255,255,255,0.08)', background:'#111', textAlign:'center' }}>
            <div style={{ fontSize:'18px', fontWeight:700, color:c }}>{v}</div>
            <div style={{ fontSize:'9px', color:'#333', fontFamily:'JetBrains Mono,monospace', marginTop:'2px' }}>{l}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize:'13px', color:'#666', margin:'0 0 8px', lineHeight:1.7 }}>{fb.verdict}</p>
      {fb.improvement && <p style={{ fontSize:'13px', color:'#555', margin:'0 0 8px', lineHeight:1.7 }}>{fb.improvement}</p>}
      {fb.better_answer && (
        <div style={{ padding:'12px 14px', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'7px', background:'rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize:'10px', color:'#333', fontFamily:'JetBrains Mono,monospace', marginBottom:'5px' }}>STRONGER ANSWER</div>
          <p style={{ fontSize:'13px', color:'#555', margin:0, lineHeight:1.7 }}>{fb.better_answer}</p>
        </div>
      )}
    </div>
  );
}