import type { CreateClientConfig } from "@/generated/backend-client/client.gen";

/**
 * API client configuration for HTTPOnly cookie-based authentication
 *
 * The backend sets HTTPOnly cookies which are automatically sent with requests
 * when credentials: "include" is set. No manual token management needed!
 */
export const createClientConfig: CreateClientConfig = (config) => ({
	...config,
	baseUrl: import.meta.env.VITE_API_BASE_URL,
	// No auth function needed - cookies are sent automatically
	headers: {
		"Content-Type": "application/json",
	},
	credentials: "include", // This is key - sends cookies automatically
});
