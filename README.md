# PrepMate — AI Voice Interview Coach

A full-stack AI-powered interview preparation platform built for CS students.

## Features
- Voice-based mock interviews with real-time transcription
- AI feedback on content, confidence, and filler words
- Resume ATS analysis with keyword matching
- Personalized questions generated from your resume
- Session history with full chat transcripts
- Editable user profile

## Tech Stack
- React 18 (frontend)
- Claude AI API (interview feedback + ATS analysis)
- Web Speech API (voice recording + text-to-speech)
- Vercel (free deployment)

## Setup

```bash
npm install
npm start
```

## Deploy

```bash
npm run build
npx vercel --prod
```

## Project Structure

```
src/
  components/     # All UI screens and components
    ui/           # Reusable UI primitives
  hooks/          # Custom React hooks (voice, speech)
  utils/          # Claude API calls, helpers
  styles/         # Design tokens and constants
```

## Built by
A CS student, for CS students. 
