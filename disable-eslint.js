// This script disables ESLint by setting environment variables
process.env.DISABLE_ESLINT_PLUGIN = 'true';
process.env.NEXT_DISABLE_ESLINT = '1';
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';

// Run the build command
const { execSync } = require('child_process');
try {
  console.log('Building with ESLint disabled...');

  // Disable TypeScript type checking during build
  process.env.NEXT_TYPESCRIPT_CHECK = '0';

  // Run the build command with all checks disabled
  execSync('next build --no-lint --no-typescript', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
