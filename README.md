# Agent Portal

A Next.js application for managing real estate agent transactions and admin dashboard.

## Features

- Agent dashboard with transaction management
- Admin portal for transaction approval and management
- Transaction form with multi-step process
- Real-time updates between agent and admin portals

## Development

To run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment to Vercel

This application is optimized for deployment on Vercel.

### Deployment Steps

1. Push your code to GitHub
2. Import your repository in Vercel
3. Vercel will automatically detect Next.js and use the right settings
4. Deploy!

### Environment Variables

The following environment variables are required:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

These are configured in `vercel.json` but can also be set in the Vercel dashboard.

### Debug Mode in Production

Debug pages are disabled in production by default. To enable them, set the environment variable:

```
NEXT_PUBLIC_ENABLE_DEBUG=true
```

## Project Structure

- `src/app`: Next.js app router pages
- `src/components`: Reusable React components
- `src/utils`: Utility functions
- `src/actions`: Server actions
- `src/contexts`: React context providers

## Tech Stack

- Next.js 15
- React 19
- Tailwind CSS
- Shadcn UI
- Supabase
- TypeScript
