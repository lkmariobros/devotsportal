const fs = require('fs');
const path = require('path');

// Function to recursively get all files in a directory
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Get all TypeScript and JavaScript files
const files = getAllFiles('src');

// Patterns to replace
const replacements = [
  { from: /from ['"]@\/app\/\(admin\)/g, to: 'from "@/app/admin-layout' },
  { from: /from ['"]@\/app\/\(agent\)/g, to: 'from "@/app/agent-layout' },
  { from: /import ['"]@\/app\/\(admin\)/g, to: 'import "@/app/admin-layout' },
  { from: /import ['"]@\/app\/\(agent\)/g, to: 'import "@/app/agent-layout' },
  { from: /['"]\/admin\//g, to: '"/admin-layout/' },
  { from: /['"]\/agent\//g, to: '"/agent-layout/' },
  { from: /['"]\.\.\/\(admin\)/g, to: '"../admin-layout' },
  { from: /['"]\.\.\/\(agent\)/g, to: '"../agent-layout' },
  { from: /['"]\.\.\/(\.\.\/)+app\/\(admin\)/g, to: '"@/app/admin-layout' },
  { from: /['"]\.\.\/(\.\.\/)+app\/\(agent\)/g, to: '"@/app/agent-layout' }
];

// Update files
let updatedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  replacements.forEach(({ from, to }) => {
    content = content.replace(from, to);
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
    updatedFiles++;
  }
});

console.log(`Updated ${updatedFiles} files`);
