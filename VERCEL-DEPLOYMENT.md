# Vercel Deployment Guide

This guide provides step-by-step instructions for deploying this application to Vercel, addressing the path alias resolution issues that were previously causing build failures.

## Understanding the Issue

The build was failing because components copied to temporary locations during the build process weren't being found through the `@/components/ui` path aliases. This happens because:

1. The path alias `@/` is configured in `tsconfig.json` but wasn't properly resolved during the Vercel build process
2. The components were physically moved, but the import paths weren't updated to match
3. Webpack's module resolution wasn't properly configured to handle the path aliases

## Solution

We've created a custom build script (`vercel-build.js`) that:

1. Sets up proper path alias resolution using symlinks and webpack configuration
2. Ensures all UI components are available in the correct locations
3. Modifies the Next.js configuration to properly handle path aliases during build

## Deployment Steps

### Option 1: Deploy from GitHub

1. Push your code to GitHub (including the new `vercel-build.js` file)
2. Go to [Vercel](https://vercel.com) and sign in
3. Click "New Project" and import your repository
4. Keep the default settings (they are configured in `vercel.json`)
5. Click "Deploy"

### Option 2: Deploy from CLI

1. Install the Vercel CLI if you haven't already:
   ```
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```
   vercel login
   ```

3. Deploy the project:
   ```
   vercel
   ```

## Environment Variables

Make sure to set the following environment variables in the Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Testing Locally

To test the build process locally before deploying:

```bash
npm run test-build
```

This will run the `vercel-build.js` script and then build the application using Next.js.

## Troubleshooting

If you encounter build errors:

1. Check the Vercel build logs for specific error messages
2. Ensure all UI components are available in the `src/components/ui` directory
3. Verify that the `vercel-build.js` script is being executed during the build process
4. Make sure your `vercel.json` file is correctly configured

## How the Fix Works

The solution works by:

1. **Creating symlinks**: We create symlinks in the `node_modules/@` directory that point to the corresponding directories in `src/`. This ensures that imports using `@/` path aliases can be resolved.

2. **Enhancing webpack configuration**: We modify the webpack configuration to properly resolve the `@/` path alias to the `src/` directory.

3. **Ensuring component availability**: We copy UI components to ensure they're available in the correct locations, even if the symlinks fail.

This approach maintains your existing import structure while ensuring it works reliably during deployment.

## Railway Deployment

If you decide to deploy to Railway instead of Vercel, you can use a similar approach:

1. Add a `railway.json` file with the following content:
   ```json
   {
     "build": {
       "builder": "NIXPACKS",
       "buildCommand": "node vercel-build.js && next build"
     },
     "deploy": {
       "startCommand": "next start",
       "healthcheckPath": "/",
       "healthcheckTimeout": 60
     }
   }
   ```

2. Deploy to Railway using their CLI or GitHub integration
