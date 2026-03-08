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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Overview
A minimalist web app that helps users learn new vocabulary words one at a time. Users select up to 10 categories from a predefined list of 20, and the app uses Claude AI to generate vocabulary words with definitions, pronunciation, and example usage. The dashboard displays one word at a time with a shuffle button. Users can opt into web push notifications for new words on a daily or hourly schedule.

## Goals & Non-Goals
**Goals:**
- Support up to 10 users (MVP)
- 20 predefined vocabulary categories users can choose from (up to 10 each)
- Auto-generate vocabulary words using Claude API (claude-sonnet-4-20250514)
- Display one word at a time with definition, pronunciation, and example usage
- Shuffle button to cycle through unseen words
- Web push notifications (off / daily / hourly)

**Non-Goals:**
- Custom user-defined categories
- Spaced repetition algorithm
- Social features or sharing
- Mobile native app
- Import/export functionality

## Architecture
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** SQLite via Prisma ORM
- **Auth:** NextAuth.js with credentials provider (email/password)
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514) for word generation
- **Notifications:** Web Push API with VAPID keys + node-cron scheduler
- **Deployment:** Single server (Node.js)

## Data Models

### User
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| email | String | Unique |
| passwordHash | String | bcrypt hashed |
| notificationPref | Enum | OFF, DAILY, HOURLY (default OFF) |
| pushSubscription | JSON | Nullable, Web Push subscription object |
| createdAt | DateTime | Auto |

### Category
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key, auto-increment |
| name | String | Unique, one of 20 predefined categories |
| slug | String | Unique, URL-friendly |

**Predefined categories (seeded):**
Technology, Finance, Healthcare, Science, Legal, Engineering, Design, Sales, Investment, Consulting, Research, Real Estate, Operations, Literature, AI, Media, Entrepreneurship, Data Science, Cybersecurity, News

### UserCategory
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key, auto-increment |
| userId | String | FK → User |
| categoryId | Int | FK → Category |
| createdAt | DateTime | Auto |

Unique constraint on (userId, categoryId). Max 10 per user enforced at API level.

### Word
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key, auto-increment |
| categoryId | Int | FK → Category |
| word | String | The vocabulary word |
| definition | String | Text, AI-generated definition |
| pronunciation | String | Phonetic pronunciation |
| exampleUsage | String | Text, sentence or short paragraph |
| createdAt | DateTime | Auto |

Unique constraint on (categoryId, word).

### UserWord
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key, auto-increment |
| userId | String | FK → User |
| wordId | Int | FK → Word |
| seen | Boolean | Default false |
| seenAt | DateTime | Nullable |

Unique constraint on (userId, wordId).

## API Endpoints

### Auth
- `POST /api/auth/register` — Register with email/password
- `POST /api/auth/[...nextauth]` — NextAuth sign-in/sign-out

### Categories
- `GET /api/categories` — List all 20 predefined categories with user's selection status
- `POST /api/categories/select` — Toggle a category on/off for current user (max 10 on)

### Words
- `GET /api/words/current` — Get current unseen word for user (random from selected categories)
- `POST /api/words/shuffle` — Mark current word as seen, return next unseen word. If all seen, reset and start over.

### Notifications
- `POST /api/notifications/subscribe` — Save push subscription
- `PUT /api/notifications/preference` — Update notification preference (OFF/DAILY/HOURLY)

## Key Workflows

### 1. Onboarding
1. User registers with email/password
2. User is shown the 20 predefined categories as a selection grid
3. User toggles up to 10 categories
4. System triggers word generation for each selected category (20 words per category via Claude)
5. User lands on dashboard with first word displayed

### 2. Word Generation (Background)
1. When a user selects a category, check if words exist for that category in the Word table
2. If fewer than 20 words exist for the category, call Claude API to generate words
3. Words are shared across users (same Category → same Words)
4. Claude prompt asks for: word, definition, phonetic pronunciation, example usage
5. Store generated words in Word table; create UserWord records for the selecting user

### 3. Dashboard Shuffle
1. Dashboard loads → `GET /api/words/current` → returns one random unseen word from user's selected categories
2. User clicks "Shuffle" → `POST /api/words/shuffle` → marks current word seen, returns next unseen word
3. When no unseen words remain across all selected categories, reset all UserWord.seen = false and start fresh
4. If unseen words for any category drop below 5, trigger background generation of 20 more words for that category

### 4. Push Notifications
1. User opts into notifications from settings (Daily at 9 AM UTC or Hourly)
2. Browser prompts for push permission, subscription saved to server
3. node-cron runs every hour: checks users with HOURLY pref → sends push with a random unseen word preview
4. node-cron runs daily at 9 AM UTC: checks users with DAILY pref → sends push
5. Clicking notification opens the dashboard

## Implementation Plan
1. Project scaffolding — Next.js 14, Tailwind, Prisma, project structure
2. Database schema — Prisma models, migrations, seed 20 predefined categories
3. Authentication — NextAuth.js with credentials provider, register/login pages
4. Category selection UI — Grid of 20 categories, toggle on/off, max 10 enforcement
5. Claude word generation service — API integration, prompt engineering, batch generation
6. Dashboard UI — Word card display, shuffle button, category filter
7. Web push notifications — VAPID setup, subscription, cron scheduler

## Open Questions
- None at this time
