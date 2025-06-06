import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    minify: 'terser',
    cssMinify: true,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'ui': ['./src/components/ui/Button.tsx', './src/components/ui/IconButton.tsx', './src/components/ui/Modal.tsx'],
          'card-detail': ['./src/components/card-detail/BusinessCardDetails.tsx', './src/components/card-detail/CardContactInfo.tsx', './src/components/card-detail/CardDetailActions.tsx', './src/components/card-detail/NonBusinessCardDetails.tsx', './src/components/card-detail/OptimizedCardDetailModal.tsx'],
          'forms': ['./src/components/forms/InputField.tsx', './src/components/forms/SelectField.tsx', './src/components/forms/OptimizedAddCardModal.tsx'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom'],
  },
});
