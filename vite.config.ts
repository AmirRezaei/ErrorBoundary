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
         rollupTypes: true,
         outDir: 'dist',
         staticImport: true,
         insertTypesEntry: true,
      }),
   ],
   build: {
      sourcemap: true,
      outDir: 'dist',
      lib: {
         entry: resolve(__dirname, 'src/index.ts'),
         name: 'ErrorBoundary',
         fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
         formats: ['es', 'cjs'],
      },
      rollupOptions: {
         external: [
            'react',
            'react-dom',
            'react/jsx-runtime',
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled',
            'lodash',
            're-resizable',
            'react-draggable',
            'react-json-view-lite',
            'react-portal'
         ],
         output: {
            globals: {
               react: 'React',
               'react-dom': 'ReactDOM',
               'react/jsx-runtime': 'jsxRuntime',
               '@mui/material': 'MaterialUI',
               '@mui/icons-material': 'MaterialIcons',
               '@emotion/react': 'emotionReact',
               '@emotion/styled': 'emotionStyled',
               'lodash': 'lodash',
               're-resizable': 'ReResizable',
               'react-draggable': 'ReactDraggable',
               'react-json-view-lite': 'ReactJsonViewLite',
               'react-portal': 'ReactPortal'
            },
            exports: 'named',
         },
      },
      minify: true,
   },
   resolve: {
      alias: {
         // Removed this alias as it's referencing the built output which is not the intended use during development.
         // When consuming the package, Node.js module resolution will handle it.
         // 'itk-error-boundary': resolve(__dirname, 'node_modules/itk-error-boundary/dist/index.js')
      }
   }
});