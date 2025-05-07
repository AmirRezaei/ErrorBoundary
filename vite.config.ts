import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import * as path from "path"; 

export default defineConfig(({ command }) => ({
  plugins: [react(), dts()],
  build: command === 'build' ? {
    lib: {
      entry: path.resolve(__dirname, 'src/components/index.ts'),
      name: 'ItkErrorBoundary',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format}.js`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
        'react-portal',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        assetFileNames: '[name][extname]',
      },
    },
    emptyOutDir: true,
    outDir: 'dist',
    assetsDir: '',
    manifest: false,
    cssCodeSplit: false,
  } : undefined,
}));
