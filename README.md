# Improve My Languages

Improve My Languages is an adaptive language learning platform designed to turn study time into measurable progress. Instead of forcing learners through static lessons, the system models skills, errors, memory retention, and session efficiency to build a personalized learning path that evolves with each interaction.

This repository contains the full Next.js application, including the adaptive engine, content model, AI-powered tutor flow, assessment logic, onboarding, and deployment-ready configuration for Vercel.

## Why this project exists

Most language learning products focus on content volume, not learning quality. The real challenge is not “how much content is available,” but “what the learner is ready to learn, what they are forgetting, and how to structure a session that maximizes retention and confidence.”

Improve My Languages addresses this by combining:

- adaptive diagnostics
- skill-level estimation
- spaced repetition
- weakness tracking
- personalized content selection
- AI-assisted feedback grounded in the learner’s actual performance

The result is a product that behaves like a learning system, not a static app shell.

---

## Product vision

The platform aims to help users improve in a practical, adaptive way across speaking, listening, reading, writing, grammar, and vocabulary. It is built for learners who want a system that adapts to their level, their weak spots, and their time constraints.

Core goals:

- diagnose real proficiency, not assumed proficiency
- personalize sessions based on performance data
- reduce forgetting through cognitive scheduling
- classify error patterns and explain progress
- support multiple languages and future expansion without redesign
- remain deployable, lightweight, and maintainable

---

## Key features

### Adaptive assessment engine

- dynamic diagnostic flow
- skill-by-skill evaluation
- CEFR-like progression model
- probabilistic estimation of learner ability
- variable-length testing depending on confidence and uncertainty

### Personalized learning engine

- spaced repetition logic inspired by robust memory models
- review prioritization based on weakness and recency
- session planning around time availability
- adjustable balance between revision, new content, and tutor interaction

### Error intelligence

- categorical error analysis
- detection of repeated weaknesses
- targeted remediation sequences
- feedback that explains why a mistake matters

### Content system

- 12 languages (EN, FR, DE, IT, PT, NL, SV, RU, AR, JA, KO, ZH) with 5,500–9,700 frequency-ranked words each (A1 → C1), conjugation tables for ~700–970 verbs per inflecting language, built from open data (Wiktionary, Tatoeba, wordfreq, Wikimedia Commons audio) — see docs/CONTENT_PIPELINE.md
- grammar syllabus A1 → C1 for every language (14–27 lessons per language, each with Spanish-speaker mistakes, contrasts and validated exercises)
- domainized vocabulary and grammar structures
- content configuration that can scale to more languages
- structured, versioned learning resources

### Real-world skills practice

- **Reader**: Wikipedia, Simple English Wikipedia, Wikinews and Wikivoyage articles ranked by how well they fit your level (vocabulary coverage), graded readings built from Tatoeba, or paste your own text. Tap any word for its translation, audio and IPA; save it to your reviews; comprehension quiz at the end
- **Listening**: real sentences at your level with adjustable speed (0.75×–1.5×), word spotting, meaning and word-level dictation grading
- **Pronunciation**: read real sentences aloud; the browser's speech recognition transcribes them and the server grades each word (no audio is stored)
- **Writing studio**: CEFR prompts (A1 → C1), instant heuristic checks (spelling, accents, capitalization, repetitions, lexical level) and optional AI correction validated against the original text

### Role-play scenarios

- 12 real-life scenarios from A1 to C1 (café, directions, doctor, job interview, debate, salary negotiation…)
- the tutor plays a role and tracks 3 communicative goals live; completing all three is celebrated and unlocks an achievement

### Daily quests and XP

- three deterministic quests per day, frozen once generated (session, weakest or favourite skill, reviews or volume)
- progress computed from real activity; claiming is transactional and idempotent
- XP derived from lifetime activity plus claimed quests, with levels and titles

### Several languages, smart timer and smart breaks

- **My languages**: mark each language as main, in progress or maintain; every day your minutes are split by priority, due reviews and neglect, and similar languages (Italian ↔ Portuguese, German ↔ Dutch) are kept apart
- **Study mode**: say how much time you have and get a timeline of blocks across languages and activities, with a floating timer that guides you from block to block
- **Smart breaks**: during a session the app watches accuracy drops, slower answers and error streaks against your learned attention span, and proposes a guided break (breathing, eye rest, stretching) or suggests stopping
- **Your rhythm**: attention span and best time of day are learned from your own answers
- **Cognates and false friends**: new words that look like Spanish are flagged as "gift words"; curated false friends get a warning

### Family & friends groups

- create a group with a 6-character code (no ambiguous characters, easy to dictate) and invite up to 8 people
- members see only name, avatar, language and level, streak and minutes this week — never mistakes, texts or emails
- send cheers (👏 💪 🔥) that appear on the recipient's home screen; leaving is one click and account deletion removes membership

### Learning-style profile

- "¿Cómo aprendes mejor?": a 15-question preference questionnaire (pace, challenge, structure, explanation depth, feedback tone, motivation, channel, goal) — framed as preferences, not "learning styles"
- 8 archetypes with strengths and tips; results tune planner block weights, difficulty, explanation depth, tutor correction tone and dashboard suggestions
- profile page with avatar, per-language levels, lifetime stats and achievements

### AI tutor

- contextual support based on learner profile
- feedback grounded in user input and learning history
- optional AI providers, including Gemini and OpenAI-compatible services
- safe UX without excessive interruption in the flow

### Progress visualization

- heatmaps and performance summaries
- skill-level dashboards
- learning streaks and retention signals
- explanation-rich analytics dashboards
- "Lo que dicen tus datos": text coverage of the words you know (Zipf), forecast to the next CEFR vocabulary level, stubborn words, current FSRS retention and accuracy trend
- word of the day just above your level, with real example and recorded audio when available

### Accessible for everyone

- guided welcome tutorial (7 steps), replayable from Settings
- **simple mode**: one big "Start" button, plain-language progress, fewer menu items
- text size (normal / large / extra large) applied app-wide before first paint
- slower speech synthesis for listening practice
- "Did you really know it? Yes / I guessed" after correct answers (a guess reschedules the item sooner)

### Privacy and user control

- explicit AI consent flow
- exportable user data
- account removal support
- server-side safeguards and environment-based secrets

---

## Tech stack

This project is built with a modern, low-friction stack designed for fast iteration and deployment on Vercel.

- Next.js 16 with App Router
- React 19
- TypeScript strict mode
- Tailwind CSS
- Firebase Auth (email/password + Google) with httpOnly session cookies
- Cloud Firestore (server-only access via Admin SDK)
- Firebase Cloud Messaging (daily reminders)
- AI provider support via Gemini or OpenAI-compatible endpoints
- Server actions and route handlers for backend logic

### Why this stack

- Next.js gives a production-ready frontend and server runtime in one app
- Firebase gives identity, data and notifications in one managed provider; all data access is isolated in `src/lib/db/repositories.ts`, so the provider can be swapped
- TypeScript reduces common logic bugs in a learning engine
- Vercel makes production deployment simple and cost-efficient
- clear separation between app logic, engine logic, and content logic makes the system easier to evolve

---

## Architecture overview

The application is structured around a few clear layers:

- app layer: routing, UI, onboarding, marketing pages, authentication flows
- services layer: orchestration of content, assessment, AI, and learner state
- engine layer: adaptive logic, skill modeling, planning, evaluation, memory scheduling
- data layer: database access, repository logic, limits, and persistence
- content layer: language content and curriculum definitions
- docs layer: specification and operational knowledge

This is intentional: the adaptive systems are built to be testable and mostly isolated from app runtime concerns.

---

## Project structure

```text
.
├── docs/
│   ├── ADAPTIVE_ENGINE.md
│   ├── AI.md
│   ├── ARCHITECTURE.md
│   ├── CONTENT_PIPELINE.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   └── SECURITY.md
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── proxy.ts
├── scripts/
│   └── dev-emulated.mjs
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── tests/
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
├── tsconfig.json
├── vercel.json
└── package-lock.json
```

---

## Local development

### Prerequisites

- Node.js 20+
- npm
- a Firebase project (Auth + Firestore)
- Java 11+ (only for the local emulators)
- optional API keys for AI providers
- optional Firebase keys for push/web notifications

### Install dependencies

```bash
npm install
```

### Environment setup

Copy the example environment file and fill the values:

```bash
cp .env.example .env.local
```

Then configure the required secrets and public variables for:

- Firebase web config (`NEXT_PUBLIC_FIREBASE_*`)
- Firebase Admin service account (`FIREBASE_SERVICE_ACCOUNT`, server only)
- optional AI providers
- Firebase web and admin configuration if using notifications

### Start the app

```bash
npm run dev
```

Then open:

- http://localhost:3000

### Useful scripts

```bash
npm run typecheck
npm run test
npm run build
npm run dev:emulated                 # Firebase emulators + seeded demo user
npm run dev:emulated -- --mock-ai    # same, plus a local OpenAI-compatible AI simulator
npm run smoke                        # signs in to the emulators and checks every page renders
npm run test:content                 # Python unit tests for the content pipeline
```

`--mock-ai` starts `scripts/mock-ai.mjs`, a deterministic fake LLM that honours every AI contract of the app (tutor chat, role-play goal markers, conversation feedback JSON, writing correction JSON). It lets you exercise and test all AI flows offline, with no keys and no cost.

---

## Database and auth setup

Firebase provides authentication (email/password + Google), Cloud Firestore and Cloud Messaging.

- The browser only signs in and exchanges the ID token for an httpOnly session cookie (`/api/auth/session`).
- Firestore is accessed **only from the server** (Admin SDK). `firestore.rules` denies all client access.
- Deploy rules, composite indexes and TTL policies with:

```bash
firebase deploy --only firestore
```

### Fully local development (no credentials needed)

```bash
npm run dev:emulated
```

Starts the Firebase Auth + Firestore emulators (demo project, requires Java 11+) and `next dev` wired to them. It seeds a demo learner with ~20 weeks of realistic history: `demo@improve.local` / `demo-password`.

See [docs/DATABASE.md](docs/DATABASE.md) for the data model.

---

## Deployment on Vercel

This project is ready for deployment to Vercel.

### Recommended deployment flow

1. Push the repository to GitHub.
2. Import the repo in Vercel.
3. Add environment variables in Vercel Project Settings.
4. Configure the production domain if needed.
5. Trigger a deployment.

### Production considerations

- keep secrets as environment variables, never in code
- use Vercel Environment Variables for production and preview
- store the Firebase service-account JSON only in the server-side `FIREBASE_SERVICE_ACCOUNT` variable
- ensure HTTPS is enabled for web push features

---

## Security notes

This project is tuned for a responsible production setup. The most important rules are:

- never commit `.env.local` or secret values
- keep `FIREBASE_SERVICE_ACCOUNT` and `CRON_SECRET` server-side only
- prefer server actions and route handlers for sensitive operations
- validate user input before writing or exposing data

More details are available in the security docs under:

- [docs/SECURITY.md](docs/SECURITY.md)

---

## Documentation

The repository includes deeper technical documentation for the key systems:

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design and structure
- [docs/ADAPTIVE_ENGINE.md](docs/ADAPTIVE_ENGINE.md) — adaptive engine behavior and learning logic
- [docs/DATABASE.md](docs/DATABASE.md) — schema and persistence
- [docs/AI.md](docs/AI.md) — AI provider setup and prompts
- [docs/CONTENT_PIPELINE.md](docs/CONTENT_PIPELINE.md) — content lifecycle and language expansion
- [docs/SECURITY.md](docs/SECURITY.md) — security and privacy model
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — production deployment guide

---

## Roadmap

### Phase 1

- adaptive assessment
- learner skill model
- spaced repetition
- personalized session planning
- progress tracking
- AI tutor integration

### Phase 2 (done)

- reader with real articles and tap-to-translate
- listening with dictation grading
- writing studio with heuristic + AI correction
- pronunciation practice with speech recognition
- learning-style profile and data-driven insights

### Phase 3

- phoneme-level pronunciation feedback
- broader mobile and PWA support
- more native languages for the interface
- stronger notification and engagement systems

---

## Contributing

Contributions are welcome. This project is designed to be extensible, but the most important principle is maintaining a high-quality learning loop rather than merely adding features.

If you want to contribute:

1. fork the repository
2. create a feature branch
3. make focused changes
4. validate with the project scripts
5. open a clear pull request with rationale and testing notes

---

## License

This project is currently intended for personal and commercial learning-platform experimentation. Please review the repository license before production deployment if you plan to ship it externally.

---

## Project status

The repository is in active product development, with a strong emphasis on the adaptive learning engine, user-centered UX, and deployment readiness for Vercel.

The long-term goal is to build a serious language learning system that is adaptive, explainable, and useful in the real world.

---

Improve My Languages is not just another flashcard app. It is a learning system designed to adapt to the learner, not the other way around.
