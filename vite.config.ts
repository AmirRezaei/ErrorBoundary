import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
   plugins: [
      react(),
      dts({
         include: ['src/**/*'],
         exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      }),
   ],
   build: {
      sourcemap: true,
      outDir: 'dist',
      lib: {
         entry: resolve(__dirname, 'src/index.ts'),
         name: 'ErrorBoundary',
         fileName: 'index',
         formats: ['es', 'cjs'],
      },
      rollupOptions: {
         external: ['react', 'react-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
         output: {
            globals: {
               react: 'React',
               'react-dom': 'ReactDOM',
               '@mui/material': 'MaterialUI',
               '@emotion/react': 'emotionReact',
               '@emotion/styled': 'emotionStyled',
            },
         },
      },
      minify: true,
   },
});
