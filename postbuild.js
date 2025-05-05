// This script restores the original configuration after building
const fs = require('fs');

// Restore the original .eslintrc.json file if the backup exists
if (fs.existsSync('.eslintrc.json.backup')) {
  console.log('Restoring original .eslintrc.json');
  fs.copyFileSync('.eslintrc.json.backup', '.eslintrc.json');
  fs.unlinkSync('.eslintrc.json.backup');
}

console.log('Postbuild completed successfully');
