/// <reference types="vitest/config" />
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// The dev/preview port defaults to Vite's 5173 but can be overridden with PORT
// (used by Playwright and Docker). The backend's CORS allow-list and the OAuth
// redirect target must match this origin — see backend/.env.example.
const port = Number(process.env.PORT ?? 5173);

export default defineConfig({
	plugins: [
		// The router plugin must run before the React plugin so generated route
		// modules are transformed by Fast Refresh.
		TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
		react(),
		tailwindcss(),
		tsconfigPaths(),
	],
	server: {
		port,
		host: true,
	},
	preview: {
		port,
		host: true,
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./vitest.setup.ts"],
		css: false,
		// Unit tests live next to source. Playwright owns everything in e2e/.
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
	},
});
