import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      exclude: [
        ...configDefaults.exclude,
        'postcss.config.js',
        '.eslintrc.cjs',
        'tailwind.config.js',
        'src/App.tsx',
        'src/index.tsx',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/components/index.ts',
        'src/components/interface.ts',
        'src/examples/CustomPhotoEditor.tsx',
        'src/examples/PhotoEditor.tsx',
      ],
    },
  },
});
