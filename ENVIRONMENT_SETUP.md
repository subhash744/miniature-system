# Environment Setup for REGEO

## Supabase Configuration

To run REGEO, you need to set up the following environment variables:

### Local Development (.env file)

Create a `.env` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Vercel Deployment

For Vercel deployment, set the following environment variables in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## How to Get Supabase Credentials

1. Go to [Supabase](https://supabase.io/)
2. Create a new project or select an existing one
3. Navigate to Project Settings > API
4. Copy the Project URL and Project API Key (anon, public)

## Environment Variable Security

- `NEXT_PUBLIC_SUPABASE_URL` - Safe to expose (public URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Safe to expose (anonymous key with limited permissions)

These are public keys that allow read/write access to your Supabase database with Row Level Security (RLS) in place to protect data.