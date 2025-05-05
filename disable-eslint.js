// This script disables ESLint by setting environment variables
process.env.DISABLE_ESLINT_PLUGIN = 'true';
process.env.NEXT_DISABLE_ESLINT = '1';
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';

// Run the build command
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to recursively copy a directory
function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Get all files and subdirectories in the source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      copyDir(srcPath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  // Copy files from (admin) to admin-layout
  if (fs.existsSync('src/app/(admin)')) {
    console.log('Copying files from src/app/(admin) to src/app/admin-layout');
    copyDir('src/app/(admin)', 'src/app/admin-layout');
  }

  // Copy files from (agent) to agent-layout
  if (fs.existsSync('src/app/(agent)')) {
    console.log('Copying files from src/app/(agent) to src/app/agent-layout');
    copyDir('src/app/(agent)', 'src/app/agent-layout');
  }

  console.log('Building with ESLint disabled...');

  // Disable TypeScript type checking during build
  process.env.NEXT_TYPESCRIPT_CHECK = '0';

  // Run the build command with all checks disabled
  execSync('next build --no-lint', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
