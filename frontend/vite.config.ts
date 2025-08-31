import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			// Proxy requests from /api to your backend server
			"/api": {
				target: "http://localhost:8000", // Your FastAPI server address
				changeOrigin: true,
				// Optional: rewrite path if your FastAPI endpoints don't start with /api
				// rewrite: (path) => path.replace(/^\/api/, '')
			},
		},
	},
});
