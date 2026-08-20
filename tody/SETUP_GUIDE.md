# Tody Platform - Setup Guide

## Quick Start

### Step 1: Clone and Install

```bash
cd tody
npm install
```

### Step 2: Configure Supabase

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up or log in

2. **Create a New Project**
   - Click "New Project"
   - Enter project details
   - Save your password (you'll need it)
   - Wait for the project to initialize

3. **Get Your Credentials**
   - Go to Project Settings → API
   - Copy your **Project URL** and **anon key**

4. **Create `.env.local`**
   ```bash
   # In the root of the tody directory
   cat > .env.local << EOF
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   EOF
   ```
   Replace with your actual credentials.

### Step 3: Initialize Database Schema

#### Option A: Using Supabase Dashboard (Recommended for First Time)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "+ New Query"
4. Copy the entire contents of `migrations/001_initial_schema.sql`
5. Paste it into the SQL editor
6. Click "Run" button
7. Wait for the query to complete (should see "succeeded")

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link your project
supabase link --project-ref your_project_ref

# Deploy migrations
supabase db push
```

### Step 4: Verify Connection

```bash
npm run dev
```

Then open [http://localhost:3000/test-db](http://localhost:3000/test-db) to verify the database connection.

You should see:
- ✅ Supabase connection successful!
- List of tables (users, categories, listings, auctions, bids, messages)

## Troubleshooting

### Missing Environment Variables
**Error**: `Missing Supabase environment variables`

**Solution**:
- Ensure `.env.local` exists in the project root
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Restart the dev server after adding env vars

### Connection Refused
**Error**: `Failed to connect to Supabase`

**Solution**:
- Verify your Supabase URL is correct (should be `https://xxxx.supabase.co`)
- Check that your anon key is valid
- Ensure your Supabase project is running (check in dashboard)

### Tables Not Found After Migration
**Error**: No tables shown on test page

**Solution**:
- The SQL migration may not have run successfully
- Check Supabase dashboard → SQL Editor → check recent queries for errors
- Verify all SQL syntax is correct
- Try running the migration again

## Database Schema Overview

### Core Tables

**users**
- Stores user accounts, roles (buyer/seller/admin), and profile info
- Location data (lat/lng) for buyer/seller proximity
- Stripe account ID for payment integration

**categories**
- Product categories with support for subcategories
- Hierarchical structure via `parent_id`

**listings**
- Marketplace items for sale
- Support for three sale types: buy_now, auction, drop
- Geolocation (PostGIS) for distance-based search
- Auto-expires in 24 hours by default

**auctions**
- Configuration for auction-style listings
- Tracks highest bidder and current price

**bids**
- Individual bids on auction listings
- Tracks bidder and bid amount

**messages**
- User-to-user messaging
- Can be linked to specific listings

## PostGIS Geolocation

The schema includes PostGIS support for distance-based queries:

```sql
-- Find listings within 5km of a location
SELECT * FROM listings
WHERE ST_DWithin(
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
  ST_SetSRID(ST_MakePoint(-73.935242, 40.730610), 4326)::geography,
  5000
);
```

## Next Steps

1. ✅ Setup Supabase connection
2. ✅ Initialize database schema
3. → Implement authentication (Phase 2)
4. → Build listing CRUD (Phase 3)
5. → Add marketplace features (Phase 4)

See `PROJECT_PLAN.md` for the full development roadmap.

## Environment Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key for client-side auth |

Note: These variables are prefixed with `NEXT_PUBLIC_` so they're safe to expose in the browser.
