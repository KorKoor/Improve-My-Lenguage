# Improve My Lenguage

Improve My Lenguage is an adaptive language learning platform designed to turn study time into measurable progress. Instead of forcing learners through static lessons, the system models skills, errors, memory retention, and session efficiency to build a personalized learning path that evolves with each interaction.

This repository contains the full Next.js application, including the adaptive engine, content model, AI-powered tutor flow, assessment logic, onboarding, and deployment-ready configuration for Vercel.

## Why this project exists

Most language learning products focus on content volume, not learning quality. The real challenge is not “how much content is available,” but “what the learner is ready to learn, what they are forgetting, and how to structure a session that maximizes retention and confidence.”

Improve My Lenguage addresses this by combining:

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

- multilingual content layers for English, French, and Japanese
- domainized vocabulary and grammar structures
- content configuration that can scale to more languages
- structured, versioned learning resources

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
- PostgreSQL via Supabase
- Supabase Auth
- Firebase (web + push notifications support)
- AI provider support via Gemini or OpenAI-compatible endpoints
- Server actions and route handlers for backend logic

### Why this stack

- Next.js gives a production-ready frontend and server runtime in one app
- PostgreSQL + SQL-first architecture keeps the data model transparent and portable
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
├── supabase/
│   └── migrations/
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
- a Supabase project
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

- Supabase URL and anon key
- database connection string
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
```

---

## Database and auth setup

The project is designed to work with Supabase for:

- authentication
- user identity management
- database persistence
- storage and operational configuration

The SQL schema is under:

```text
supabase/migrations/
```

It is recommended to run the migration scripts in Supabase SQL Editor before using the app in a fresh environment.

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
- store service-account JSON only in secret server-side variables
- ensure HTTPS is enabled for web push features

---

## Security notes

This project is tuned for a responsible production setup. The most important rules are:

- never commit `.env.local` or secret values
- keep `FIREBASE_SERVICE_ACCOUNT` and database credentials server-side only
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

### Phase 2

- richer reading and listening experiences
- improved grammar feedback
- more advanced content workflows
- broader mobile and PWA support

### Phase 3

- speaking and pronunciation evaluation
- deeper personalization and analytics
- multi-language growth and content sourcing
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

Improve My Lenguage is not just another flashcard app. It is a learning system designed to adapt to the learner, not the other way around.
