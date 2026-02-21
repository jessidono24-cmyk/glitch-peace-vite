import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  server: {
    port: 3000,
    open: true,
    watch: {
      ignored: ['**/_archive/**']
    }
  },
  optimizeDeps: {
    exclude: ['_archive'],
  },
  // FIX6: Exclude legacy _archive directory from all Vite processing
  resolve: {
    exclude: ['_archive'],
  },
});
