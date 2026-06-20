// Reads from .env file — NEVER hardcode your key here directly
const GROQ_KEY = process.env.REACT_APP_GROQ_KEY;

const GROQ_CHAT_API  = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_TEXT_MODEL = 'llama-3.3-70b-versatile';

async function callAI(prompt, maxTokens = 1500) {
  try {
    if (!GROQ_KEY) {
      console.error('GROQ key missing. Add REACT_APP_GROQ_KEY to your .env file and restart npm start.');
      return null;
    }
    const res = await fetch(GROQ_CHAT_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_TEXT_MODEL,
        max_tokens: maxTokens,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Groq chat HTTP error:', res.status, errText);
      return null;
    }
    const data = await res.json();
    if (data.error) { console.error('Groq chat error:', data.error); return null; }
    return data.choices?.[0]?.message?.content || null;
  } catch (e) { console.error('Network error:', e); return null; }
}

function parseJSON(raw) {
  if (!raw) return null;
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); }
  catch {
    const match = raw.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (match) { try { return JSON.parse(match[0]); } catch { return null; } }
    return null;
  }
}

// ── GROQ WHISPER — transcribe audio blob ─────────────────────────────────────
export async function transcribeAudio(audioBlob) {
  try {
    if (!GROQ_KEY) {
      console.error('GROQ key missing. Add REACT_APP_GROQ_KEY to your .env file and restart npm start.');
      return null;
    }
    console.log('Transcribing blob:', audioBlob.size, 'bytes, type:', audioBlob.type);

    if (audioBlob.size < 2000) {
      console.error('Audio blob too small — likely empty/silent recording');
      return null;
    }

    const ext = audioBlob.type.includes('webm') ? 'webm' : audioBlob.type.includes('ogg') ? 'ogg' : 'wav';
    const formData = new FormData();
    formData.append('file', audioBlob, `recording.${ext}`);
    formData.append('model', 'whisper-large-v3');
    formData.append('response_format', 'json');

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_KEY}` },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Groq HTTP error:', res.status, errText);
      return null;
    }

    const data = await res.json();
    console.log('Groq response:', data);
    if (data.error) { console.error('Groq error:', data.error); return null; }
    return data.text?.trim() || null;
  } catch (e) { console.error('Transcription error:', e); return null; }
}

export async function analyseResume(resumeText, jobDesc) {
  const prompt = `You are a professional ATS expert and resume coach.
Analyse this resume against the job description like a real ATS machine.

RESUME:
"""${resumeText.slice(0, 3000)}"""

JOB DESCRIPTION:
"""${jobDesc.slice(0, 1500)}"""

Reply ONLY in this exact JSON, no markdown:
{"ats_score":78,"grade":"B+","verdict":"one sentence verdict referencing specifics","strong_keywords":["kw1","kw2"],"missing_keywords":["kw1","kw2"],"formatting_issues":["issue1","issue2"],"weak_phrases":["phrase1","phrase2"],"how_to_make_perfect":["tip1","tip2","tip3","tip4","tip5"],"readability_score":72,"keyword_density":68,"action_verb_score":60}`;

  const raw = await callAI(prompt, 1200);
  const parsed = parseJSON(raw);
  if (parsed?.ats_score) return parsed;

  // Local fallback if AI call fails
  const resume = resumeText.toLowerCase();
  const jd = jobDesc.toLowerCase();
  const techKeywords = ['react','python','node','typescript','docker','sql','git','api','java','aws','mongodb','css','javascript'];
  const strong = techKeywords.filter(k => resume.includes(k));
  const missing = techKeywords.filter(k => jd.includes(k) && !resume.includes(k));
  const score = Math.min(92, 40 + strong.length * 4);
  return {
    ats_score: score, grade: score>=85?'A':score>=75?'B+':score>=65?'B':'C+',
    verdict: `${strong.length} matching keywords found. ${missing.length} keywords from the JD are missing.`,
    strong_keywords: strong.slice(0,6), missing_keywords: missing.slice(0,5),
    formatting_issues: ['Ensure consistent bullet style','Check date formatting is consistent'],
    weak_phrases: ['responsible for','worked on','helped with'],
    how_to_make_perfect: [
      'Add missing keywords naturally in your experience bullets',
      'Quantify every achievement with numbers',
      'Add a 2-3 line professional summary at the top',
      'Replace weak phrases with strong action verbs',
      'Add links to GitHub and LinkedIn',
    ],
    readability_score: 70, keyword_density: Math.round(score*0.85), action_verb_score: 65,
  };
}

export async function generateQuestions(company, role, resumeText, jobDesc = '') {
  const prompt = `You are a senior technical interviewer at ${company} for the role of ${role}.

Here is the candidate's resume:
"""${resumeText.slice(0, 2500)}"""

${jobDesc ? `Job description:\n"""${jobDesc.slice(0, 800)}"""\n` : ''}

Generate exactly 8 interview questions SPECIFICALLY tailored to this candidate's actual resume and the ${role} role at ${company}.

For each question provide:
- The question itself (reference specific projects/skills from their resume)
- A strong model answer (2-4 sentences)
- 3-4 key points the candidate MUST cover
- One thing to avoid saying
- type: "technical" | "behavioural" | "resume" | "situational"
- difficulty: "easy" | "medium" | "hard"

Reply ONLY as a raw JSON array, no markdown:
[{"question":"...","model_answer":"...","key_points":["..."],"what_not_to_say":"...","type":"technical","difficulty":"medium"}]`;

  const raw = await callAI(prompt, 2000);
  const qs = parseJSON(raw);
  if (Array.isArray(qs) && qs.length >= 4 && qs[0].question) return qs;

  // Fallback question bank if AI call fails
  return [
    { question:`Walk me through the most technically challenging project on your resume.`, model_answer:`Name the project and its goal, explain the specific technical challenge, describe your exact solution, and quantify the outcome.`, key_points:['Name the project','Specific challenge','Your exact solution','Measurable outcome'], what_not_to_say:`Avoid saying "we" — show your individual contribution.`, type:'resume', difficulty:'medium' },
    { question:`Why do you specifically want to join ${company} as a ${role}?`, model_answer:`Research ${company}'s products and mission. Connect it to your skills and career goals. Show you understand what makes ${company} different.`, key_points:['Specific company knowledge','Connection to your skills','Your long-term goal','Why this role specifically'], what_not_to_say:`Avoid generic answers like "it's a big company".`, type:'behavioural', difficulty:'easy' },
    { question:`Tell me about a time you had to learn a new technology quickly under a deadline.`, model_answer:`Use STAR — Situation, Task, Action (how you learned fast), Result.`, key_points:['Specific technology','Why it was urgent','How you learned it fast','What you delivered'], what_not_to_say:`Don't say you just "Googled it" as the whole answer.`, type:'behavioural', difficulty:'medium' },
    { question:`Explain a data structure or algorithm you used in one of your projects and why you chose it.`, model_answer:`Name the data structure, explain the problem it solved, why you chose it over alternatives, and the complexity trade-off.`, key_points:['Specific data structure','Problem it solved','Why not another structure','Time/space complexity'], what_not_to_say:`Don't just name it without explaining why it was the right choice.`, type:'technical', difficulty:'medium' },
    { question:`Describe a situation where you disagreed with a teammate. How did you handle it?`, model_answer:`Show you listened first, communicated your view with reasoning, reached a compromise, and maintained the relationship.`, key_points:['Real specific situation','How you listened','How you communicated','The outcome'], what_not_to_say:`Don't say you've never disagreed with anyone.`, type:'behavioural', difficulty:'medium' },
    { question:`What is the difference between REST and GraphQL? When would you use each?`, model_answer:`REST uses fixed endpoints returning full resources. GraphQL uses one endpoint where clients specify exactly what they need. Use REST for simple APIs, GraphQL when clients need flexible queries.`, key_points:['Core difference','Over-fetching problem','When to use REST','When to use GraphQL'], what_not_to_say:`Don't say GraphQL is always better.`, type:'technical', difficulty:'hard' },
    { question:`If you had to improve the performance of a slow web application, what steps would you take?`, model_answer:`Profile first to find the bottleneck. Then address: lazy loading, caching, query optimization, CDN, code splitting. Measure before and after.`, key_points:['Profile first','Frontend vs backend','Specific techniques','Measure impact'], what_not_to_say:`Don't jump to "rewrite it" without diagnosing first.`, type:'situational', difficulty:'hard' },
    { question:`Where do you see yourself in 2-3 years if you get this internship?`, model_answer:`Show ambition grounded in reality. Connect what you'd learn here to a clear career direction.`, key_points:['Realistic specific goal','Connection to this role','Growth direction','Shows you value the opportunity'], what_not_to_say:`Don't say "I want your job" or give a vague answer.`, type:'behavioural', difficulty:'easy' },
  ];
}

export async function evaluateAnswer(question, answer, company, role) {
  const fillers = (answer.match(/\b(um|umm|uh|like|you know|basically|literally|sort of|kind of)\b/gi) || []).length;
  const words   = answer.split(/\s+/).filter(Boolean).length;

  const prompt = `You are a strict interviewer at ${company} for ${role}.
Question: "${question}"
Answer: "${answer}"
Words: ${words}. Fillers: ${fillers}.

Score honestly. Dismissive/very short (under 15 words) = 1-3. Vague = 4-6. Specific with structure = 7-10.

Reply ONLY in JSON:
{"score":6,"confidence":"Medium","content_rating":"Average","filler_count":${fillers},"word_count":${words},"verdict":"specific verdict","strength":"specific strength","improvement":"specific improvement","better_answer":"2-3 sentence example of a strong answer"}`;

  const raw = await callAI(prompt, 700);
  const parsed = parseJSON(raw);
  if (parsed?.score !== undefined) return parsed;

  // Fallback scoring if AI call fails
  const isDismissive = /\b(don'?t want|skip|pass|won'?t answer)\b/i.test(answer);
  const score = isDismissive||words<8 ? 1 : words<20 ? 3 : words<40 ? 5 : words<70 ? 6 : 7;
  return {
    score, confidence: fillers>4?'Low':fillers>1?'Medium':'High',
    content_rating: score<=3?'Poor':score<=6?'Average':'Good',
    filler_count: fillers, word_count: words,
    verdict: isDismissive ? 'Declined to answer — major red flag.' : score<=4 ? 'Too brief to demonstrate competence.' : 'Reasonable but lacks specificity.',
    strength: isDismissive ? 'None' : words>30 ? 'Engaged with the question.' : 'Limited.',
    improvement: 'Add specific examples and quantified outcomes.',
    better_answer: 'A strong candidate references a specific project, explains their exact role, and quantifies the outcome.',
  };
}