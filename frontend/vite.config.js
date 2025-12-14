import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    proxy: {
      // This forwards any request starting with /api to your backend
      '/api': {
        target: 'http://localhost:5000', // CHANGE THIS to your backend port if different
        changeOrigin: true,
        secure: false,
      }
    }
  }
})