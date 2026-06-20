# PrepMate — AI Interview Coach

PrepMate is a full-stack web app that helps job seekers prepare for technical interviews using AI. It analyzes a candidate's resume against a real job description, generates interview questions tailored to that specific resume and role, and scores spoken or written answers with actionable feedback — all in real time.

**Live demo:** _(add your deployed link here once hosted, e.g. Vercel/Netlify)_

---

## Why I built this

Most interview prep tools ask generic questions like "tell me about yourself" regardless of who you are or what job you're applying for. PrepMate instead reads your actual resume and the actual job description, then builds a question set tied to your specific projects, skills, and the target company/role — closer to what a real interview would ask.

## Features

- **Google Sign-In** via Firebase Authentication, with persistent login
- **Resume parsing** — real text extraction from uploaded PDFs (via `pdf.js`), or paste resume text directly
- **ATS-style resume analysis** — keyword match against the job description, readability and action-verb scoring, missing-section detection, and a prioritized list of fixes to improve the resume
- **AI-generated interview questions** — built from the candidate's resume content, job description, and target company/role, mixing technical, behavioral, resume-specific, and situational questions
- **Voice-based mock interviews** — record spoken answers, transcribed via the Groq Whisper API, with the AI question read aloud using browser text-to-speech
- **Text-based mode** as a reliable fallback to voice
- **AI answer scoring** — each answer is scored 1–10 with a confidence rating, filler-word detection, specific feedback, and an example of a stronger answer
- **Job application tracker** — a built-in spreadsheet (company, role, status, date applied, salary, link, notes) plus a rich-text sticky note pad, both saved locally between sessions
- **Session history** — past interviews are saved with scores so progress is trackable over time

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 (Create React App) |
| Auth | Firebase Authentication (Google OAuth) |
| AI / LLM | Groq API (Llama 3.3 for text generation, Whisper Large v3 for speech-to-text) |
| PDF parsing | pdf.js |
| Voice | Web Audio API (`MediaRecorder`, `AudioContext`) + browser Speech Synthesis API |
| Storage | Browser `localStorage` (job tracker and notes persist across sessions) |
| Styling | Hand-built CSS-in-JS, no UI framework |

## Architecture notes

- All AI calls (resume analysis, question generation, answer scoring, and voice transcription) go through a single Groq API key — no backend server required, the React app calls the API directly from the browser
- Every AI function includes a **local fallback**: if the API call fails or the key is missing, the app still works using rule-based logic, so a flaky network or rate limit doesn't break the user's session
- Voice recording uses the raw `MediaRecorder` + `getUserMedia` browser APIs rather than the unreliable native `SpeechRecognition` API, with real-time waveform visualization and playback before submitting
- API keys are never committed to the repo — see Setup below

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

Run the app:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000). Voice recording requires `localhost` or `https` (browser security requirement for microphone access).

## What I'd build next

- Server-side proxy for the AI API calls so the key never touches the client at all
- Export interview sessions and tracker data as a PDF report
- Multi-language support for non-English resumes and interviews

---

Built by Athul Krishna K S — [LinkedIn](#) · [Portfolio](#)
