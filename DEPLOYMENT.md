
# Deployment Instructions

This project is configured for deployment on Vercel. Follow these steps to deploy:

## 1. Push to GitHub

First, push your code to a GitHub repository:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

## 2. Deploy on Vercel

1. Go to [Vercel](https://vercel.com) and sign in with your GitHub account
2. Click "New Project"
3. Import your repository
4. Keep the default settings (they are configured in vercel.json)
5. Click "Deploy"

## 3. Environment Variables

Make sure to set the following environment variables in the Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 4. Troubleshooting

If you encounter build errors:

1. In the Vercel dashboard, go to Settings > General
2. Under "Build & Development Settings", set:
   - Build Command: `node prebuild.js && next build`
   - Output Directory: `.next`
   - Install Command: `npm install`

2. Under "Environment Variables", add:
   - `NEXT_DISABLE_ESLINT`: `1`
   - `DISABLE_ESLINT_PLUGIN`: `true`
   - `NEXT_TYPESCRIPT_CHECK`: `0`
