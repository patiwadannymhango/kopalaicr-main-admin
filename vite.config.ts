import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // kopalaicr-api's CORS_ALLOWED_ORIGINS defaults reserve 5177-5179 for
    // this admin dashboard (5173-5176 are the public kopalaicr site's Vite
    // dev port + fallbacks) — see backend/config/settings/base.py. Vite
    // falls forward to 5178/5179 on its own if 5177 is already taken by
    // another instance, which are covered by that same default.
    port: 5177,
  },
  build: {
    rollupOptions: {
      output: {
        // Split MUI/DataGrid/Charts into their own chunk — they're large
        // but change far less often than app code, so this keeps repeat
        // visits fast via browser caching.
        manualChunks(id) {
          if (id.includes('@mui/x-data-grid') || id.includes('@mui/x-charts')) {
            return 'mui-x';
          }
          if (id.includes('@mui') || id.includes('@emotion')) {
            return 'mui';
          }
        },
      },
    },
  },
})
