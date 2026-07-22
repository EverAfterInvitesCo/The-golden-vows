import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig(() => {
  return {
    base: '/The-golden-vows/',
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ""),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""),
      'import.meta.env.VITE_WEDDING_SLUG': JSON.stringify(process.env.VITE_WEDDING_SLUG || "tasneem-yehia"),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://localhost:3000', // Change this if your backend runs on a different port
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
