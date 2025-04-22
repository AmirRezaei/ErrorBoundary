import {vitePluginErrorOverlay} from '@hiogawa/vite-plugin-error-overlay';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'url';
import {defineConfig} from 'vite';
import {viteSingleFile} from 'vite-plugin-singlefile';

export default defineConfig({
   base: './', // Ensure correct relative paths for static builds
   plugins: [react(), vitePluginErrorOverlay(), viteSingleFile()],
   server: {
      open: process.env.NODE_ENV === 'development', // Open browser in dev mode
      port: 3000,
      hmr: {
         overlay: false, // Disable Vite's error overlay
      },
   },
   build: {
      sourcemap: process.env.NODE_ENV === 'development', // Disable in production
      outDir: 'dist',
      assetsInlineLimit: 10 * 4096, // Default inline limit for small assets
   },
   define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
   },
   resolve: {
      alias: {
         '@': fileURLToPath(new URL('./src', import.meta.url)), // Shorten imports to `@`
      },
   },
});
