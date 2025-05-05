const fs = require('fs');
const path = require('path');

// Folders to rename
const foldersToRename = [
  { from: 'src/app/(admin)', to: 'src/app/admin-layout' },
  { from: 'src/app/(agent)', to: 'src/app/agent-layout' }
];

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

// Rename folders
for (const { from, to } of foldersToRename) {
  if (fs.existsSync(from)) {
    console.log(`Renaming ${from} to ${to}`);
    
    // Copy the directory to the new location
    copyDir(from, to);
    
    // We don't delete the original directory to avoid data loss
    console.log(`Successfully copied ${from} to ${to}`);
  } else {
    console.log(`Directory ${from} does not exist, skipping`);
  }
}

console.log('Folder renaming completed');
