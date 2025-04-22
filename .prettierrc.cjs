// File: ./.prettierrc.cjs

// HEADER-START
// Path: ./.prettierrc.cjs
// HEADER-END
module.exports = {
   tabWidth: 3, // Number of spaces per indentation level
   useTabs: false, // Indent lines with spaces instead of tabs
   semi: true, // Print semicolons at the ends of statements
   singleQuote: true, // Use single quotes instead of double quotes
   trailingComma: 'all', // Add trailing commas wherever possible (including function parameters)
   bracketSpacing: false, // Do not print spaces between brackets in object literals
   arrowParens: 'avoid', // Omit parentheses when arrow functions have a single argument
   endOfLine: 'auto', // Enforce line feed (`\n`) as the end-of-line character
   proseWrap: 'preserve', // Do not change the wrapping style of markdown text
   htmlWhitespaceSensitivity: 'css', // Respect the default value of CSS display property
   singleAttributePerLine: false, // Do not enforce a new line for each attribute in HTML
   bracketSameLine: true, // Keep closing brackets of JSX elements on the same line
   jsxSingleQuote: true, // Use single quotes in JSX attributes instead of double quotes
   quoteProps: 'consistent', // Ensure consistent quoting of object properties
   embeddedLanguageFormatting: 'auto', // Format embedded code if Prettier can automatically identify it
   printWidth: 120, // Increase the print width to prevent splitting imports into multiple lines
   overrides: [
      {
         files: '*.json', // Apply these rules to all JSON files
         options: {
            tabWidth: 2, // Use 2 spaces per indentation level in JSON
         },
      },
      {
         files: '*.md', // Apply these rules to all Markdown files
         options: {
            proseWrap: 'always', // Wrap markdown text to fit the print width
         },
      },
      {
         files: '*.ts', // Apply these rules to all TypeScript files
         options: {
            parser: 'typescript', // Use the TypeScript parser
         },
      },
      {
         files: '*.tsx', // Apply these rules to all TSX (TypeScript + JSX) files
         options: {
            parser: 'typescript', // Use the TypeScript parser for TSX files
         },
      },
   ],
};
