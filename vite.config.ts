import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      // Ajout du plugin singleFile pour tout fusionner dans l'index.html
      plugins: [react(), viteSingleFile()],
      
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      
      resolve: {
        alias: {
          // Garde tes alias actuels
          '@': path.resolve(__dirname, '.'),
        }
      },

      // Configuration de build optimisée pour le fichier unique
      build: {
        target: "esnext",
        assetsInlineLimit: 100000000, // Force l'intégration des assets (images, sons) en base64
        chunkSizeWarningLimit: 100000000,
        cssCodeSplit: false, // Empêche la création d'un fichier CSS séparé
        outDir: "dist",
      },
    };
});