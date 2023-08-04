import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        dts({
            rollupTypes: true,
        }),
    ],
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.tsx"),
            name: "ReactPhotoEditor",
            fileName: (format) => `react-photo-editor.${format}.js`,
            formats: ["es"]
        },
        rollupOptions: {
            external: ["react", "react-dom"],
            output: {
                globals: {
                    react: "React",
                },
            },
        },
        minify: true,
    },
});
