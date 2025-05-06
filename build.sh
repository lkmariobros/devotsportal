#!/bin/bash
export NEXT_DISABLE_STATIC_GENERATION=true
export NEXT_DISABLE_ESLINT=1
export DISABLE_ESLINT_PLUGIN=true
export NEXT_TYPESCRIPT_CHECK=0

echo "Running Next.js build with static generation disabled..."
npx next build --no-lint
