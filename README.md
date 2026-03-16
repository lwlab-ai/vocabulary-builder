# vocabulary-builder
A web application that helps users learn new vocabulary words one at a time through an interactive and progressive learning experience.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Overview
A minimalist web app that helps users learn new vocabulary words one at a time. Users select up to X categories from a predefined list of Y, and the app uses Claude AI to generate vocabulary words with definitions, pronunciation, and example usage. The dashboard displays one word at a time with a shuffle button. Users can opt into web push notifications for new words on a daily or hourly schedule.

## Architecture
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** SQLite via Prisma ORM
- **Auth:** NextAuth.js with credentials provider (email/password)
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514) for word generation
- **Notifications:** Web Push API with VAPID keys + node-cron scheduler
- **Deployment:** Single server (Node.js)

## Usage of AI
This is a test project built by my Dev Agent Team (I call it Capy AI, and will open source it once I finish fine-tuning) with me doing the polishing and optimizing. Capy AI comes with **a Tech Lead, a PM, a UX designer and numerous dev agents. They work together to bring ideas live.** I believe in the future of software development where AI does the work while good engineers remain the master mind.