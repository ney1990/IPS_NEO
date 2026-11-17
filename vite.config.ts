import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  // GitHub Pages project sites are served under /IPS_NEO/.
  // Development and other hosting environments continue using /.
  base: mode === 'pages' ? '/IPS_NEO/' : '/',
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
}));
