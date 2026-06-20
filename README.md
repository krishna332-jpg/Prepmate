# PrepMate — AI Interview Coach

**[Live App →](https://prepmate-six.vercel.app/)**

PrepMate is a full-stack web app that helps job seekers prepare for technical interviews using AI. It reads a candidate's actual resume and a real job description, generates interview questions tailored to that specific person and role, and scores spoken or written answers with concrete, actionable feedback — built end-to-end as a personal project to prepare for my own internship search.

## The problem this solves

Most interview prep tools ask the same generic questions ("tell me about yourself," "what's your biggest weakness") regardless of who's answering or what job they're applying for. PrepMate instead parses the candidate's resume and the job description, then builds a custom question set tied to that person's actual projects, skills, and the target company — closer to what a real interviewer would ask.

## What it does

1. **Sign up / Google Sign-In** — Firebase Authentication with persistent login
2. **Upload a resume** — either paste the text directly, or upload a PDF (parsed client-side with `pdf.js`, real text extraction, not just a file upload placeholder)
3. **Paste a job description**, pick a target company and role
4. **Get an ATS-style resume analysis** — a 0–100 score, keyword match against the job description, readability and action-verb scoring, missing-section detection, and a prioritized checklist of fixes
5. **Run a mock interview** in either:
   - **Voice mode** — the AI reads each question aloud (browser text-to-speech), you record your spoken answer, it's transcribed via the Groq Whisper API, and scored
   - **Text mode** — type your answer instead, scored the same way
6. **Get scored feedback per answer** — a 1–10 score, confidence rating, filler-word count, what was missing, and a concrete example of a stronger answer
7. **Track every application** — a built-in spreadsheet (company, role, status, date applied, salary, link, notes) with a sticky-note pad for free-form notes, both saved locally between sessions
8. **Review session history** — every completed mock interview is saved with its score, so progress is trackable over time

## Tech stack

| Layer | Tech | Why |
|---|---|---|
| Frontend | React 18 (Create React App) | Component-driven UI, no backend needed for this scope |
| Auth | Firebase Authentication (Google OAuth) | Real auth without building a user/session backend from scratch |
| AI / LLM | Groq API — Llama 3.3 70B (text), Whisper Large v3 (speech-to-text) | Free tier, fast inference, no billing risk for a portfolio project |
| PDF parsing | pdf.js | Real client-side text extraction, not a fake upload |
| Voice capture | Web Audio API (`MediaRecorder`, `AudioContext`) | More reliable than the browser's native, inconsistent `SpeechRecognition` API |
| Speech output | Web Speech Synthesis API | Free, built into the browser, no extra service needed |
| Persistence | `localStorage` | Job tracker and notes survive page refreshes without a database |
| Deployment | Vercel | Auto-deploys from GitHub on every push |

## Engineering decisions worth highlighting

- **Every AI call has a local fallback.** If the Groq API call fails, rate-limits, or the key is missing, resume analysis, question generation, and answer scoring all still work using rule-based logic instead of crashing or showing a blank screen.
- **Voice recording uses raw browser APIs, not the unreliable native SpeechRecognition API.** Audio is captured with `MediaRecorder`, visualized in real time with `AudioContext`, and played back for the user to verify before submitting — this was a deliberate choice after the native API proved inconsistent across browsers during testing.
- **No backend server.** All AI requests go directly from the browser to Groq's API. This keeps the project simple to deploy and run, with the explicit tradeoff that the API key lives in a client-side environment variable — documented below, with a server-side proxy listed as the natural next step.
- **Locked user flow.** The app won't let you start a mock interview without first completing resume analysis — this was an intentional UX constraint to make sure every interview session is actually personalized, not skippable.

## Setup

```bash
git clone https://github.com/krishna332-jpg/Prepmate.git
cd Prepmate
npm install
```

Create a `.env` file in the project root (use `.env.example` as a template):

```
REACT_APP_GROQ_KEY=your_groq_key_here
```

Get a free Groq API key at [console.groq.com/keys](https://console.groq.com/keys) — no credit card required.

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000). Voice recording requires `localhost` or `https` — this is a browser security requirement for microphone access, not a bug.

## Known limitations / what I'd improve next

- The Groq API key currently lives in a client-exposed environment variable. The next step is a small serverless function (Vercel Edge Function or similar) to proxy AI requests so the key never reaches the browser at all.
- Job tracker data is stored in `localStorage`, so it's per-browser, not synced across devices — a real backend (Firestore, since Firebase is already in use) would fix this.
- No automated tests yet — given more time, I'd add component tests for the scoring logic and the resume parsing fallback paths first, since those are the most failure-prone parts.

---

**Athul Krishna K S**
[Portfolio](https://athul-krishna-k-s.vercel.app/) · [LinkedIn](https://www.linkedin.com/in/athul-krishna-k-s-135a42338/) · [Live App](https://prepmate-six.vercel.app/)
