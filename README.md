# WowTok

AI video generator for TikTok and other short-form platforms. You describe the video you want, write the narration and pick a visual style, and WowTok turns it into a vertical 9:16 video with generated scenes, motion and voiceover.

WowTok was live with 100+ daily users. It is currently offline while the product is being repositioned, and the code is shared here as a portfolio piece.

Built end to end by [Michele Scotellaro](https://www.linkedin.com/in/michelescotellaro/): product, design, frontend, backend, payments and the AI pipeline.

## What it does

1. The user picks a theme and visual style, describes the video and writes (or generates) the narration.
2. **GPT-4o-mini** splits the narration into scenes and writes a visual description for each one.
3. **FLUX Pro** (via fal.ai) generates an image per scene in the chosen style.
4. **Kling** (via fal.ai) animates each image into a short video clip.
5. **ElevenLabs** generates the voiceover.
6. **ffmpeg** (via fal.ai) merges the clips and the audio into the final 9:16 MP4.

Each step updates the video's status in the database, so the dashboard shows where every video is in the pipeline, and failed or stuck generations can be retried.

## Tech stack

- **App:** Next.js (App Router), React 19, TypeScript
- **UI:** Tailwind CSS v4, shadcn/ui, Radix, Framer Motion
- **Data and auth:** Supabase (PostgreSQL, Auth, Storage) with Prisma
- **Payments:** Stripe subscriptions (monthly credit plans) and pay-as-you-go credit packs, with webhooks and multi-currency prices
- **AI:** OpenAI, fal.ai (FLUX, Kling, ffmpeg), ElevenLabs
- **i18n:** next-intl, 10 languages
- **Quality and security:** Vitest tests, strict Content Security Policy and security headers, the processing endpoint protected by an internal secret
- **Hosting:** Vercel

## Project structure

```
src/
├── app/            # Pages and API routes (videos, Stripe webhooks, contact, support)
├── components/     # Landing, dashboard, auth, blog, SEO and shadcn/ui components
├── config/         # Site config, themes and visual styles
├── i18n/           # Locale routing and messages loading
├── lib/
│   ├── ai/         # OpenAI, fal.ai and ElevenLabs clients and the video pipeline
│   ├── stripe/     # Plans, checkout and server actions
│   └── supabase/   # Browser and server clients
└── types/
messages/           # Translations
prisma/             # Schema and migrations
```

## Running locally

Requirements: Node.js 20+, a Supabase project, and Stripe, OpenAI, ElevenLabs and fal.ai accounts.

```bash
npm install
cp .env.example .env.local   # fill in your own keys
npx prisma db push
npm run dev
```

Create a public Supabase storage bucket named `media`. For local Stripe webhooks:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Run the tests with `npm test`.

## License

All rights reserved. The code is published for portfolio purposes; please get in touch before reusing it.
