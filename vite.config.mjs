// vite.config.js
import { defineConfig } from 'vite';

let API_URL = 'http://localhost:4000';

export default defineConfig({
  root: '.',  // the root directory of your project
  build: {
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    outDir: 'dist',  // output directory for built files
  },
  server: {
    proxy: {
      '/api': API_URL, // Proxy API requests to Go server
      '/eventpic': API_URL, // Proxy static requests to Go server
      '/userpic': API_URL, // Proxy static requests to Go server
      '/merchpic': API_URL, // Proxy static requests to Go server
      '/placepic': API_URL, // Proxy static requests to Go server
      '/postpic': API_URL, // Proxy static requests to Go server
      '/uploads': API_URL, // Proxy static requests to Go server
    },
  },
});
