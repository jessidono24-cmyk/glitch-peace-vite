import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  server: {
    open: false,
    watch: {
      ignored: ['**/old-game-archive/**']
    }
  },
  optimizeDeps: {
    exclude: ['old-game-archive'],
  },
});
