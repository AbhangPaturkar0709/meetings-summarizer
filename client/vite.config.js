import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [react()],
    server: {
      hmr: mode === 'development' ? true : false, // Disable HMR in production
    },
    build: {
      outDir: 'dist',
    },
  };
});
