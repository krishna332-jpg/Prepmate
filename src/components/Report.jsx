import { T } from '../styles/tokens';
import { scoreColor } from '../utils/helpers';

export function Report({ session, onNewInterview, onAllSessions }) {
  if (!session) return null;
  const fbs    = session.chatLog.filter(c => c.isFeedback && c.fb);
  const avg    = fbs.length ? fbs.reduce((a,b)=>a+b.fb.score,0)/fbs.length : 0;
  const score  = session.score;
  const grade  = score>=85?'A':score>=75?'B+':score>=65?'B':score>=55?'C+':'C';
  const avgConf= fbs.length ? fbs.filter(f=>f.fb.confidence==='High').length/fbs.length : 0;
  const confLabel = avgConf>=0.6 ? 'High' : avgConf>=0.35 ? 'Medium' : 'Low';
  const confColor = avgConf>=0.6 ? T.green : avgConf>=0.35 ? T.amber : T.red;
  const totalFillers = fbs.reduce((a,b)=>a+(b.fb.filler_count||0),0);

  // Collect improvements
  const improvements = fbs.map(f=>f.fb.improvement).filter(Boolean);
  const strengths    = fbs.map(f=>f.fb.strength).filter(Boolean);

  const verdict = score>=80 ? "Outstanding performance. You're ready for the real thing." :
                  score>=65 ? "Strong foundation. A few targeted improvements will get you there." :
                  score>=50 ? "Good effort. Focus on the areas below and you'll see big gains." :
                              "Keep practicing. Every session makes you sharper.";

  return (
    <div style={{ padding:'clamp(20px,3vw,44px) clamp(16px,3vw,44px)', maxWidth:'1000px', margin:'0 auto', animation:'fadeUp 0.5s ease' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'16px', marginBottom:'clamp(24px,3vw,40px)' }}>
        <div>
          <div style={{ fontSize:'10px', color:'#60A5FA', letterSpacing:'0.14em', fontFamily:T.mono, marginBottom:'8px' }}>SESSION REPORT</div>
          <h2 style={{ fontFamily:T.display, fontSize:'clamp(26px,4vw,48px)', fontWeight:800, letterSpacing:'-0.03em', color:T.white, margin:'0 0 4px' }}>{session.company}</h2>
          <p style={{ color:T.muted, fontSize:'14px', margin:0 }}>{session.role} — {session.date}</p>
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:T.display, fontSize:'clamp(56px,8vw,88px)', fontWeight:800, lineHeight:1, letterSpacing:'-0.04em', color:scoreColor(score,T) }}>{score}</div>
          <div style={{ fontSize:'10px', color:T.muted, letterSpacing:'0.1em', fontFamily:T.mono }}>READINESS</div>
          <div style={{ fontFamily:T.display, fontSize:'26px', fontWeight:700, color:'#60A5FA', marginTop:'2px' }}>{grade}</div>
        </div>
      </div>

      {/* Verdict */}
      <div style={{ background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.15)', borderRadius:'14px', padding:'20px 24px', marginBottom:'24px' }}>
        <p style={{ fontFamily:T.display, fontSize:'clamp(15px,2vw,18px)', color:T.white, margin:0, lineHeight:1.6, fontStyle:'italic' }}>"{verdict}"</p>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'12px', marginBottom:'28px' }}>
        {[
          { l:'Questions',   v:session.questions.length,      c:'#3B82F6' },
          { l:'Avg Score',   v:`${avg.toFixed(1)}/10`,        c:scoreColor(avg*10,T) },
          { l:'Confidence',  v:confLabel,                     c:confColor },
          { l:'Filler Words',v:`${totalFillers} total`,       c:totalFillers<=4?T.green:T.amber },
        ].map(({l,v,c})=>(
          <div key={l} style={{ background:T.bgCard, border:'1px solid rgba(255,255,255,0.05)', borderRadius:'12px', padding:'18px', textAlign:'center' }}>
            <div style={{ fontFamily:T.display, fontSize:'clamp(20px,2.5vw,28px)', fontWeight:700, color:c }}>{v}</div>
            <div style={{ fontSize:'11px', color:T.muted, marginTop:'4px', fontFamily:T.mono, letterSpacing:'0.06em' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Strengths + Improvements */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'28px' }}>
        <div style={{ background:T.bgCard, border:'1px solid rgba(16,185,129,0.15)', borderRadius:'14px', padding:'20px' }}>
          <div style={{ fontSize:'10px', color:T.green, letterSpacing:'0.12em', fontFamily:T.mono, marginBottom:'14px' }}>STRENGTHS</div>
          {strengths.slice(0,4).map((s,i)=>(
            <div key={i} style={{ display:'flex', gap:'8px', alignItems:'flex-start', marginBottom:'10px' }}>
              <span style={{ color:T.green, fontSize:'14px', flexShrink:0, marginTop:'1px' }}>✓</span>
              <span style={{ fontSize:'13px', color:T.mutedLt, lineHeight:1.6 }}>{s}</span>
            </div>
          ))}
          {strengths.length===0 && <p style={{ fontSize:'13px', color:T.muted, margin:0 }}>Complete more questions to see your strengths.</p>}
        </div>
        <div style={{ background:T.bgCard, border:'1px solid rgba(245,158,11,0.15)', borderRadius:'14px', padding:'20px' }}>
          <div style={{ fontSize:'10px', color:T.amber, letterSpacing:'0.12em', fontFamily:T.mono, marginBottom:'14px' }}>AREAS TO IMPROVE</div>
          {improvements.slice(0,4).map((s,i)=>(
            <div key={i} style={{ display:'flex', gap:'8px', alignItems:'flex-start', marginBottom:'10px' }}>
              <span style={{ color:T.amber, fontSize:'14px', flexShrink:0, marginTop:'1px' }}>→</span>
              <span style={{ fontSize:'13px', color:T.mutedLt, lineHeight:1.6 }}>{s}</span>
            </div>
          ))}
          {improvements.length===0 && <p style={{ fontSize:'13px', color:T.muted, margin:0 }}>Complete more questions to see improvement areas.</p>}
        </div>
      </div>

      {/* Full transcript */}
      <div style={{ background:T.bgCard, border:'1px solid rgba(255,255,255,0.05)', borderRadius:'14px', padding:'clamp(16px,2vw,28px)', marginBottom:'24px' }}>
        <div style={{ fontSize:'10px', color:'#60A5FA', letterSpacing:'0.12em', fontFamily:T.mono, marginBottom:'18px' }}>FULL TRANSCRIPT</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'12px', maxHeight:'400px', overflowY:'auto' }}>
          {session.chatLog.map((msg,i)=>(
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:msg.role==='ai'?'flex-start':'flex-end' }}>
              <div style={{ fontSize:'10px', color:T.muted, marginBottom:'3px', fontFamily:T.mono }}>{msg.role==='ai'?'AI Interviewer':'You'} — {msg.ts}</div>
              <div style={{ maxWidth:'80%', padding:'10px 14px', borderRadius:msg.role==='ai'?'4px 12px 12px 12px':'12px 4px 12px 12px', background:msg.role==='ai'?T.bgCardLt:'rgba(59,130,246,0.08)', border:`1px solid ${msg.role==='ai'?'rgba(255,255,255,0.04)':'rgba(59,130,246,0.15)'}` }}>
                {msg.isFeedback && msg.fb ? (
                  <div>
                    <div style={{ display:'flex', gap:'8px', marginBottom:'8px', flexWrap:'wrap' }}>
                      {[{l:'Score',v:`${msg.fb.score}/10`,c:scoreColor(msg.fb.score*10,T)},{l:'Confidence',v:msg.fb.confidence,c:msg.fb.confidence==='High'?T.green:msg.fb.confidence==='Medium'?T.amber:T.red},{l:'Fillers',v:`${msg.fb.filler_count}x`,c:msg.fb.filler_count<=2?T.green:T.amber}].map(({l,v,c})=>(
                        <span key={l} style={{ padding:'2px 10px', borderRadius:'100px', background:`${c}15`, border:`1px solid ${c}30`, color:c, fontSize:'10px', fontFamily:T.mono }}>{l}: {v}</span>
                      ))}
                    </div>
                    <p style={{ margin:0, fontSize:'12px', color:T.mutedLt, lineHeight:1.7 }}>{msg.text}</p>
                  </div>
                ) : (
                  <p style={{ margin:0, fontSize:'13px', color:T.white, lineHeight:1.7, fontStyle:msg.role==='ai'?'italic':'normal', fontWeight:300 }}>{msg.text}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
        <button onClick={onNewInterview}
          style={{ padding:'13px 32px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#3B82F6,#2563EB)', color:'#fff', fontSize:'14px', fontWeight:600, fontFamily:T.body, cursor:'pointer', boxShadow:'0 6px 20px rgba(59,130,246,0.35)', transition:'all 0.2s' }}
          onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 10px 28px rgba(59,130,246,0.48)'; }}
          onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 6px 20px rgba(59,130,246,0.35)'; }}
        >Start New Interview</button>
        <button onClick={onAllSessions}
          style={{ padding:'13px 24px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.09)', background:'rgba(255,255,255,0.03)', color:T.mutedLt, fontSize:'14px', fontFamily:T.body, cursor:'pointer', transition:'all 0.2s' }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(59,130,246,0.3)'; e.currentTarget.style.color=T.white; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; e.currentTarget.style.color=T.mutedLt; }}
        >All Sessions</button>
      </div>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
