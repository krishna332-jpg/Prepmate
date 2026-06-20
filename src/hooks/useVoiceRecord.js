import { useState, useRef, useCallback } from 'react';

export function useVoiceRecord({ onResult, silenceMs = 3000 }) {
  const [recording,  setRecording]  = useState(false);
  const [liveTxt,    setLiveTxt]    = useState('');
  const [volBars,    setVolBars]    = useState(Array(40).fill(4));
  const [error,      setError]      = useState('');

  const recogRef   = useRef(null);
  const streamRef  = useRef(null);
  const animRef    = useRef(null);
  const silRef     = useRef(null);
  const lastTxtRef = useRef('');

  const cleanup = useCallback(() => {
    try { recogRef.current?.abort(); } catch(e) {}
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (animRef.current)   { cancelAnimationFrame(animRef.current); animRef.current = null; }
    if (silRef.current)    { clearTimeout(silRef.current); silRef.current = null; }
    setRecording(false);
    setVolBars(Array(40).fill(4));
  }, []);

  const start = useCallback(async () => {
    setError('');
    lastTxtRef.current = '';

    // Check browser support
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError('Voice not supported. Please use Chrome or Edge browser.');
      return;
    }

    // Request mic permission explicitly
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      // Volume visualizer
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx      = new AudioCtx();
        const source   = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        const buf = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(buf);
          const bars = Array.from({ length: 40 }, (_, i) => {
            const idx = Math.floor(i * buf.length / 40);
            return Math.max(4, (buf[idx] / 255) * 52);
          });
          setVolBars(bars);
          animRef.current = requestAnimationFrame(tick);
        };
        tick();
      }
    } catch (err) {
      setError('Microphone access denied. Click the mic icon in your browser address bar and allow access.');
      return;
    }

    // Start speech recognition
    const recog = new SR();
    recog.continuous     = true;
    recog.interimResults = true;
    recog.lang           = 'en-US';
    recog.maxAlternatives= 1;

    recog.onstart = () => {
      setRecording(true);
      setLiveTxt('');
    };

    recog.onresult = (e) => {
      let interim = '';
      let final   = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + ' ';
        else interim += t;
      }
      const combined = (lastTxtRef.current + final + interim).trim();
      lastTxtRef.current = lastTxtRef.current + final;
      setLiveTxt(combined);

      // Reset silence timer on speech
      if (silRef.current) clearTimeout(silRef.current);
      if (combined.length > 3) {
        silRef.current = setTimeout(() => {
          const answer = lastTxtRef.current.trim() || combined.trim();
          if (answer.length > 3) {
            cleanup();
            setLiveTxt('');
            onResult(answer);
          }
        }, silenceMs);
      }
    };

    recog.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setError('Microphone blocked. Allow mic access in browser settings and refresh.');
      } else if (e.error === 'network') {
        setError('Network error with speech recognition. Check your internet connection.');
      } else if (e.error !== 'aborted') {
        setError(`Voice error: ${e.error}. Try refreshing the page.`);
      }
      cleanup();
    };

    recog.onend = () => {
      // Auto-restart if still recording (Chrome stops after silence)
      if (recording && streamRef.current) {
        try { recog.start(); } catch(e) { cleanup(); }
      }
    };

    try {
      recog.start();
      recogRef.current = recog;
    } catch(e) {
      setError('Could not start voice recognition. Please refresh and try again.');
      cleanup();
    }
  }, [onResult, silenceMs, cleanup, recording]);

  const stop = useCallback(() => {
    const answer = lastTxtRef.current.trim();
    cleanup();
    setLiveTxt('');
    if (answer.length > 3) onResult(answer);
  }, [cleanup, onResult]);

  const reset = useCallback(() => {
    setLiveTxt('');
    setError('');
    lastTxtRef.current = '';
  }, []);

  return { recording, liveTxt, volBars, error, start, stop, reset };
}
