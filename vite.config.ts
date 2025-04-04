import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		dts({
			rollupTypes: true,
		}),
		libInjectCss(),
	],
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/index.tsx'),
			name: 'ReactPhotoEditor',
			formats: ['es'],
			fileName: (format) => `react-photo-editor.${format}.js`,
		},
		rollupOptions: {
			external: ['react', 'react-dom'],
			output: {
				globals: {
					react: 'React',
				},
			},
		},
		minify: true,
	},
});
