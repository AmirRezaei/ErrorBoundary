// File: ./prepend-filename.cjs

const fs = require('fs');
const path = require('path');
const minimatch = require('minimatch');

// Configuration
const CONFIG = {
   SHORT_HEADERS: ['.cjs', '.js'],
   EXCLUDED_PATTERNS: [
      'node_modules/**',
      '.git/**',
      'dist/**',
      'build/**',
      '.env',
      'README.md',
      '.prettierrc.json',
      'package.json',
      '**/*.json',
   ],
   HEADER_PREFIX: '// File: ',
   PURPOSE_PREFIXES: ['// ! Purpose:', '//! Purpose:'],
};

/**
 * Retrieves the file path from command-line arguments.
 * Exits the process if no file path is provided.
 * @returns {string} The file path.
 */
const getFilePathFromArgs = () => {
   const filePath = process.argv[2];
   if (!filePath) {
      console.error('Error: No file specified. Please provide a file path as the first argument.');
      process.exit(1);
   }
   return filePath;
};

/**
 * Determines if a file should be excluded based on predefined patterns.
 * @param {string} filePath - The path of the file to check.
 * @returns {boolean} True if the file is excluded, otherwise false.
 */
const isFileExcluded = filePath => {
   return CONFIG.EXCLUDED_PATTERNS.some(pattern => minimatch(filePath, pattern, {dot: true}));
};

/**
 * Selects the appropriate header type based on the file extension.
 * @param {string} filePath - The path of the file.
 * @returns {string} 'SHORT' or 'DETAILED'.
 */
const selectHeaderType = filePath => {
   const isShortHeader = CONFIG.SHORT_HEADERS.some(ext => filePath.endsWith(ext));
   return isShortHeader ? 'SHORT' : 'DETAILED';
};

/**
 * Extracts the current purpose from the header section of the file.
 * @param {string[]} lines - The lines of the file.
 * @returns {string|null} The extracted purpose or null if not found.
 */
const extractCurrentPurpose = lines => {
   for (const line of lines) {
      for (const prefix of CONFIG.PURPOSE_PREFIXES) {
         if (line.trim().startsWith(prefix)) {
            const match = line.match(/! Purpose:\s*(.*)/);
            if (match) {
               return match[1].trim();
            }
         }
      }
   }
   return null;
};

/**
 * Generates the relative path for the file, ensuring it starts with './'.
 * @param {string} filePath - The absolute or relative path of the file.
 * @returns {string} The normalized relative path.
 */
const getRelativePath = filePath => {
   return './' + path.relative(process.cwd(), filePath).replace(/\\/g, '/');
};

/**
 * Generates the new header based on the header type and current purpose.
 * @param {string} relativePath - The relative path of the file.
 * @param {string|null} currentPurpose - The current purpose of the file.
 * @param {string} headerType - 'SHORT' or 'DETAILED'.
 * @returns {string[]} The new header lines.
 */
const generateNewHeader = (relativePath, currentPurpose, headerType) => {
   const headerLines = [`${CONFIG.HEADER_PREFIX}${relativePath}`];
   if (headerType === 'DETAILED' && currentPurpose) {
      headerLines.push(`// ! Purpose: ${currentPurpose}`);
   }
   return headerLines;
};

/**
 * Updates the header of the specified file with the appropriate signature.
 * @param {string} filePath - The path of the file to update.
 */
const updateFileHeader = filePath => {
   try {
      const relativePath = getRelativePath(filePath);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      const headerType = selectHeaderType(filePath);
      let currentPurpose = null;

      if (headerType === 'DETAILED') {
         currentPurpose = extractCurrentPurpose(lines);
      }

      const newHeader = generateNewHeader(relativePath, currentPurpose, headerType);

      // Determine how many lines to replace (existing header lines)
      let headerEndIndex = -1;
      let headerStartIndex = -1;

      for (let i = 0; i < lines.length; i++) {
         if (lines[i].startsWith(CONFIG.HEADER_PREFIX)) {
            headerStartIndex = i;
            // For detailed headers, assume the next line might be the purpose
            if (
               headerType === 'DETAILED' &&
               i + 1 < lines.length &&
               CONFIG.PURPOSE_PREFIXES.some(prefix => lines[i + 1].trim().startsWith(prefix))
            ) {
               headerEndIndex = i + 1;
            } else {
               headerEndIndex = i;
            }
            break;
         }
      }

      let updatedLines;
      if (headerStartIndex !== -1 && headerEndIndex !== -1) {
         // Replace existing header
         updatedLines = [...lines.slice(0, headerStartIndex), ...newHeader, ...lines.slice(headerEndIndex + 1)];
      } else {
         // Prepend new header
         updatedLines = [...newHeader, '', ...lines];
      }

      fs.writeFileSync(filePath, updatedLines.join('\n'), 'utf-8');
      console.log(`✅ Updated header in ${relativePath}`);
   } catch (error) {
      console.error(`❌ Error processing file ${filePath}:`, error.message);
      process.exit(1);
   }
};

/**
 * The main function orchestrating the header update process.
 */
const main = () => {
   const filePath = getFilePathFromArgs();
   console.log(`📄 Processing: ${filePath}`);

   if (isFileExcluded(filePath)) {
      console.log(`🚫 Skipping excluded file: ${filePath}`);
      process.exit(0);
   }

   updateFileHeader(filePath);
};

// Execute the script
main();
