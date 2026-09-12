import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Vite configuration for the React frontend.
export default defineConfig({
    plugins: [react()],
    resolve: { alias: { 'legal-docs': process.env.LEGAL_DOCS_DIR || path.resolve(__dirname, '../docs'), }, },
});
