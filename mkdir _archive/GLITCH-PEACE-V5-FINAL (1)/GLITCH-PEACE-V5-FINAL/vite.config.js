import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => ({
  plugins: [viteSingleFile()],
  
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined,
        entryFileNames: mode === 'lite' 
          ? 'glitch-peace-v5-lite.html'
          : mode === 'recovery'
          ? 'glitch-peace-v5-recovery.html'
          : 'glitch-peace-v5.html',
      },
    },
  },
  
  define: {
    __MODE__: JSON.stringify(mode),
    __LITE__: mode === 'lite',
    __RECOVERY__: mode === 'recovery',
  },
}));
