import { defaultPlugins, defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
	input: "./openapi.json",
	output: "src/generated/backend-client",
	plugins: [
		...defaultPlugins,
		"@hey-api/schemas",
		{
			name: "@hey-api/client-next",
			runtimeConfigPath: "@/hey-api",
		},
		"@tanstack/react-query",
		"zod",
		{
			name: "@hey-api/sdk",
			validator: true,
		},
	],
});
