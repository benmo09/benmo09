# Tody Platform

A modern marketplace platform built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase

#### Option A: Create a new Supabase project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key
4. Create a `.env.local` file in the root and add:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

#### Option B: Use existing Supabase project
1. Update `.env.local` with your credentials

### 3. Run Database Migrations

#### Using Supabase Dashboard:
1. Go to Supabase Dashboard
2. Open SQL Editor
3. Create a new query
4. Copy contents of `migrations/001_initial_schema.sql`
5. Run the query

#### Using Supabase CLI:
```bash
npm install -g supabase
supabase link --project-ref your_project_ref
supabase db push
```

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
tody/
├── app/                    # Next.js App Router pages
├── components/             # React components
├── lib/                   # Utilities (supabase client, etc.)
├── public/                # Static assets
├── migrations/            # SQL migrations
├── .env.local            # Environment variables (create this)
├── PROJECT_PLAN.md       # Development roadmap
└── tailwind.config.ts    # Tailwind configuration
```

## Database Schema

See `PROJECT_PLAN.md` for complete database schema documentation.

### Tables:
- **users** - User accounts and profiles
- **categories** - Product categories and subcategories
- **listings** - Marketplace listings
- **auctions** - Auction configurations
- **bids** - Auction bids
- **messages** - User-to-user messaging

## Tech Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Backend**: Supabase (PostgreSQL + Auth + PostGIS)
- **Maps**: PostGIS for geolocation
- **Payments**: Stripe (planned)

## Development Phases

See `PROJECT_PLAN.md` for detailed development roadmap.

## Contributing

Follow the development phases outlined in `PROJECT_PLAN.md`.
