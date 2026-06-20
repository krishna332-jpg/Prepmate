import { useState, useCallback } from 'react';

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback((text, voiceGender = 'female') => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    if (voiceGender === 'male') {
      const v = voices.find(v => /male|david|james|daniel|google uk english male/i.test(v.name));
      if (v) utt.voice = v;
      utt.pitch = 0.85; utt.rate = 0.92;
    } else {
      const v = voices.find(v => /female|zira|samantha|karen|google uk english female/i.test(v.name));
      if (v) utt.voice = v;
      utt.pitch = 1.08; utt.rate = 0.93;
    }
    utt.volume = 1;
    utt.onstart = () => setSpeaking(true);
    utt.onend   = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
    return utt;
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking };
}
