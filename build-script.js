const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create a not-found page if it doesn't exist
if (!fs.existsSync('src/app/not-found.tsx')) {
  console.log('Creating not-found page');
  const notFoundContent = `
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h2 className="text-4xl font-bold mb-4">Page Not Found</h2>
      <p className="mb-8">Could not find the requested resource</p>
      <a href="/" className="text-blue-500 hover:underline">
        Return Home
      </a>
    </div>
  )
}`;
  fs.writeFileSync('src/app/not-found.tsx', notFoundContent);
}

// Run the prebuild script
console.log('Running prebuild script');
require('./prebuild');

// Set environment variables for the build
process.env.NEXT_DISABLE_ESLINT = '1';
process.env.DISABLE_ESLINT_PLUGIN = 'true';
process.env.NEXT_TYPESCRIPT_CHECK = '0';
process.env.NODE_ENV = 'production';

// Run the build command
try {
  console.log('Running Next.js build');
  execSync('next build --no-lint', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
