export function countFillers(text) {
  return (text.match(/\b(um|umm|uh|like|you know|basically|literally|sort of|kind of)\b/gi) || []).length;
}

export function scoreColor(score, T) {
  if (score >= 75) return T.green;
  if (score >= 50) return T.amber;
  return T.red;
}

export function confidenceColor(conf, T) {
  if (conf === 'High')   return T.green;
  if (conf === 'Medium') return T.amber;
  return T.red;
}

export function formatDate(d = new Date()) {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatTime(d = new Date()) {
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}
