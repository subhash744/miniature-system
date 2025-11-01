# Deployment Guide

This document provides instructions for deploying the REGEO application to various platforms.

## Prerequisites

Before deploying, ensure you have:

1. A Supabase account and project
2. Environment variables configured:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`

## Vercel Deployment

### Automatic Deployment (Recommended)

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Add the required environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## Docker Deployment

### Build and Run Locally

```bash
# Build the Docker image
docker build -t rigeo .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  -e NEXT_PUBLIC_SITE_URL=your_site_url \
  rigeo
```

### Using Docker Compose

```bash
# Build and start services
docker-compose up --build

# Run in detached mode
docker-compose up -d
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Build Process

The application uses Next.js for building and deployment:

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the production server
npm start
```

## CI/CD Pipeline

For automated deployments, you can use GitHub Actions. Create a workflow file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring and Analytics

The application includes Vercel Analytics for production monitoring. You can also integrate with other monitoring tools like:

- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for user behavior

## Performance Optimization

The application is optimized for performance with:

- Server-side rendering (SSR)
- Static site generation (SSG) where appropriate
- Image optimization
- Code splitting
- Caching strategies

## Security Considerations

- All environment variables are properly secured
- HTTPS is enforced in production
- Content Security Policy headers are configured
- Rate limiting should be implemented at the Supabase level