/**
 * Vite build configuration.
 * Replaces Create React App (react-scripts), which is unmaintained and
 * pulls in a long tail of deprecated transitive dependencies (old eslint,
 * glob, rimraf, workbox, babel proposal plugins, etc — all the "npm warn
 * deprecated" lines from `npm install`). Vite has none of that, and is
 * dramatically faster in dev (native ES modules, no full bundle on every
 * start) and comparable or faster for production builds.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],

    // Vite only exposes env vars prefixed with VITE_ to client code (a
    // deliberate security default — anything without the prefix stays
    // server/build-only and never reaches the browser bundle). This replaces
    // CRA's equivalent REACT_APP_ prefix convention.
    envPrefix: 'VITE_',

    server: {
        port: 3000, // match CRA's old default so existing habits/bookmarks still work
    },

    build: {
        outDir: 'dist', // Vite's default; CRA used "build" — update your host's
        // publish directory setting to "dist" if it's still set to "build"
    },
});
