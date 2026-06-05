/// <reference types="vite/client" />

interface ImportMetaEnv {
	/** Base URL of the FastAPI backend, e.g. http://localhost:8000 */
	readonly VITE_API_BASE_URL?: string;
	/** "true" to show the Google OAuth button (backend GOOGLE_OAUTH_ENABLED=True) */
	readonly VITE_GOOGLE_OAUTH_ENABLED?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

// CSS-only font packages ship no type declarations; allow side-effect imports.
declare module "@fontsource-variable/inter";
declare module "@fontsource-variable/lexend";
