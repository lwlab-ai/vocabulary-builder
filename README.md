# Vocabulary Builder

> Learn one word at a time. Intelligently.

A minimalist, AI-powered vocabulary learning app that delivers curated words — with definitions, pronunciation, and real-world usage — personalized to the categories you care about.

---

## Features

- **Personalized word selection** — choose from a predefined set of categories to tailor your vocabulary feed
- **AI-generated content** — every word, definition, and example sentence is generated on-demand by Claude AI
- **One word at a time** — distraction-free dashboard focused on deep learning, not firehose memorization
- **Push notifications** — opt into daily or hourly word delivery via Web Push
- **Invite-only access** — currently in private beta

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | SQLite via Prisma ORM |
| Auth | NextAuth.js (email/password) |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Notifications | Web Push API + VAPID + node-cron |
| Deployment | Node.js (single server) |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage of AI

This project is a product of a new kind of software development, one where AI agents do the heavy lifting while a human engineer holds the vision.

Majority of the codebase was built by **Capy AI**, a custom multi-agent dev team (currently being fine-tuned for open source release). The team consists of a Tech Lead, a PM, a UX Designer, and a swarm of specialized dev agents that coordinate, argue, and ship together. They don't just generate code, they plan, review, and iterate like a real team.

My role: **designer and master of the tech stack.** I set the architecture, define the constraints, make the calls, polish the features and shape the product. The agents execute. This is what I believe the future of engineering looks like, not AI replacing engineers, but engineers who know how to direct AI doing the work of entire teams.

Capy AI will be open sourced once fine-tuning is complete.

---

## License

MIT
