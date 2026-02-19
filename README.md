# Promptok

AI-powered TikTok video generator. Create stunning short-form videos from simple text prompts.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: Next.js API Routes & Server Actions
- **Database**: Supabase (PostgreSQL) + Prisma ORM
- **Auth**: Supabase Auth (Google + Email/Password)
- **Payments**: Stripe (Checkout, Webhooks, Customer Portal)
- **AI**: OpenAI GPT-4o-mini, ElevenLabs, fal.ai (FLUX + Hailuo)
- **Jobs**: Inngest (background video generation)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Supabase project
- Stripe account
- OpenAI API key
- ElevenLabs API key
- fal.ai API key

### Setup

1. Clone the repo:
```bash
git clone https://github.com/scottof/promptok.git
cd promptok
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your `.env.local` with keys from:
   - [Supabase](https://supabase.com) — Project URL, anon key, service role key, database URL
   - [Stripe](https://stripe.com) — Secret key, publishable key, webhook secret, price IDs
   - [OpenAI](https://platform.openai.com) — API key
   - [ElevenLabs](https://elevenlabs.io) — API key
   - [fal.ai](https://fal.ai) — API key

5. Set up the database:
```bash
npx prisma db push
npx prisma generate
```

6. Create a Supabase storage bucket named `media` (public).

7. Run the development server:
```bash
npm run dev
```

8. For local Stripe webhooks:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

9. For Inngest dev server:
```bash
npx inngest-cli dev
```

### Stripe Setup

Create 3 products in Stripe with recurring monthly prices:
- **Starter**: $19/month
- **Creator**: $49/month
- **Pro**: $99/month

Copy the price IDs into your `.env.local`.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes (webhooks, videos, inngest)
│   ├── blog/               # Blog pages (SEO)
│   ├── dashboard/          # Protected dashboard pages
│   ├── login/ & signup/    # Auth pages
│   └── pricing/            # Pricing page
├── components/
│   ├── dashboard/          # Dashboard-specific components
│   ├── landing/            # Landing page sections
│   ├── shared/             # Shared components (navbar, footer, logo)
│   └── ui/                 # shadcn/ui components
├── config/                 # Site config, theme definitions
├── hooks/                  # React hooks
├── inngest/                # Background job functions
├── lib/
│   ├── ai/                 # AI integrations (OpenAI, fal.ai, ElevenLabs)
│   ├── stripe/             # Stripe client, config, server actions
│   └── supabase/           # Supabase clients (browser + server)
└── types/                  # TypeScript type definitions
```

## AI Video Pipeline

1. User inputs: theme, prompt, narration text
2. **GPT-4o-mini** splits text into 4-6 scenes with visual descriptions
3. **FLUX.2 Pro** generates an image per scene
4. **Hailuo** animates each image into video clips
5. **ElevenLabs** generates voiceover audio
6. Final video assembled and delivered as 9:16 MP4

## License

MIT
