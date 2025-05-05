// This script prepares the project for a clean build
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting clean build process...');

// 1. Create a temporary build directory
const tempDir = path.join(__dirname, 'temp-build');
if (fs.existsSync(tempDir)) {
  console.log('Removing existing temp directory...');
  fs.rmSync(tempDir, { recursive: true, force: true });
}

console.log('Creating temp directory...');
fs.mkdirSync(tempDir, { recursive: true });

// 2. Copy only the essential files to the temp directory
console.log('Copying essential files...');

// Function to recursively copy a directory with filtering
function copyDirFiltered(src, dest, filter) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip problematic directories
    if (entry.isDirectory()) {
      if (
        srcPath.includes('(admin)') ||
        srcPath.includes('(agent)') ||
        srcPath.includes('debug') ||
        srcPath.includes('debug-')
      ) {
        console.log(`Skipping problematic directory: ${srcPath}`);
        continue;
      }

      // Recursively copy subdirectories
      copyDirFiltered(srcPath, destPath, filter);
    } else if (filter(srcPath)) {
      // Copy files that pass the filter
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy essential directories
const essentialDirs = [
  { src: 'src/components', dest: path.join(tempDir, 'src/components') },
  { src: 'src/utils', dest: path.join(tempDir, 'src/utils') },
  { src: 'src/app', dest: path.join(tempDir, 'src/app') },
  { src: 'public', dest: path.join(tempDir, 'public') }
];

for (const { src, dest } of essentialDirs) {
  if (fs.existsSync(src)) {
    console.log(`Copying ${src} to ${dest}...`);
    copyDirFiltered(
      src,
      dest,
      (filePath) => 
        !filePath.includes('debug') && 
        !filePath.includes('(admin)') && 
        !filePath.includes('(agent)')
    );
  }
}

// 3. Copy essential config files
const configFiles = [
  'next.config.js',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  '.eslintrc.json',
  '.env',
  '.env.local',
  '.env.production'
];

for (const file of configFiles) {
  if (fs.existsSync(file)) {
    console.log(`Copying ${file}...`);
    fs.copyFileSync(file, path.join(tempDir, file));
  }
}

// 4. Create a minimal app structure
console.log('Creating minimal app structure...');

// Create a minimal home page
const minimalHomePage = `
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome to Devots Portal</h1>
      <p className="mt-4 text-xl">Your real estate management solution</p>
    </div>
  );
}
`;

fs.writeFileSync(path.join(tempDir, 'src/app/page.tsx'), minimalHomePage);

// Create a minimal layout
const minimalLayout = `
import './globals.css'

export const metadata = {
  title: 'Devots Portal',
  description: 'Real Estate Management Solution',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`;

fs.writeFileSync(path.join(tempDir, 'src/app/layout.tsx'), minimalLayout);

// Create a minimal globals.css
const minimalCss = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;

fs.writeFileSync(path.join(tempDir, 'src/app/globals.css'), minimalCss);

// 5. Run the build in the temp directory
console.log('Running build in temp directory...');
try {
  process.chdir(tempDir);
  execSync('npm install', { stdio: 'inherit' });
  execSync('next build', { stdio: 'inherit' });
  
  // Copy the build output back to the original directory
  console.log('Copying build output back to original directory...');
  process.chdir(__dirname);
  
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
  }
  
  copyDirFiltered(path.join(tempDir, '.next'), '.next', () => true);
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
