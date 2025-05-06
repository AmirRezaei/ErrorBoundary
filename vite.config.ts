import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  plugins: [react(), dts()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/components/index.ts'), // Ensure entry point is correct
      name: 'ItkErrorBoundary',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
        'react-portal'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        // Disable inclusion of fonts and static assets
        assetFileNames: '[name][extname]' // This will make sure that assets like fonts aren't bundled
      }
    },
    emptyOutDir: true,  // Ensure no leftovers in dist/
    outDir: 'dist',     // Define the output directory
    assetsDir: '',      // Ensure that no assets are bundled (disable static files)
    manifest: false,    // Avoid generating manifest.json
    cssCodeSplit: false // Disable CSS code splitting to generate a single CSS file
  }
});
