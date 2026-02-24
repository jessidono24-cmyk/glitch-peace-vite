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
      ignored: ['**/old-game-archive/**']
    }
  },
  optimizeDeps: {
    exclude: ['old-game-archive'],
  },
  // FIX6: Exclude legacy old-game-archive directory from all Vite processing
  resolve: {
    exclude: ['old-game-archive'],
  },
});
