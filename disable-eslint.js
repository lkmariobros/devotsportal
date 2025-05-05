// This script disables ESLint by setting environment variables
process.env.DISABLE_ESLINT_PLUGIN = 'true';
process.env.NEXT_DISABLE_ESLINT = '1';

// Run the build command
const { execSync } = require('child_process');
try {
  console.log('Building with ESLint disabled...');
  execSync('next build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
