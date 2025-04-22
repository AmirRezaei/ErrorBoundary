// HEADER-START
// Path: prepend-all-files.cjs
// HEADER-END
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const {execSync} = require('child_process');

// Find all `.ts`, `.tsx`, and `.json` files
const includedFiles = glob.sync('src/**/*.{ts,tsx,json}').concat(glob.sync('.vscode/*.{ts,tsx,json}'));
const excludedFiles = ['prepend-filename.js', '.prettierrc.json']; // Exclude specific files

// Filter included files to exclude the ones listed in excludedFiles
const files = includedFiles.filter(filePath => !excludedFiles.some(excluded => filePath.includes(excluded)));

// Process each file
files.forEach(filePath => {
   try {
      // Run `prepend-filename.cjs` for each file
      const command = `node prepend-filename.js --file "${filePath}"`;
      console.log(`Processing file: ${filePath}`);
      execSync(command, {stdio: 'inherit'});
   } catch (error) {
      console.error(`Error processing file ${filePath}:`, error.message);
   }
});
