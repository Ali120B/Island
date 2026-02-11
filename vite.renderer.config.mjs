import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config
export default defineConfig({
      plugins: [react()],
      assetsInclude: ['**/*.mp3'],
      build: {
            rollupOptions: {
                  input: {
                        main: './index.html',
                        settings: './settings.html'
                  },
                  output: {
                        assetFileNames: 'assets/[name].[ext]'
                  }
            }
      },
      resolve: {
            alias: {
                  "@": "/src",
            },
      },
});
