import { type APIRequestContext } from "@playwright/test";

import { randomEmail, randomPassword } from "./random";

interface CreateTestUserOptions {
	email?: string;
	password?: string;
	apiBaseUrl?: string;
}

function resolveApiBaseUrl(override?: string) {
	const baseUrl =
		override ?? process.env.PLAYWRIGHT_API_BASE_URL ?? process.env.API_BASE_URL;
	return (baseUrl ?? "http://127.0.0.1:8000").replace(/\/$/, "");
}

export async function createTestUser(
	request: APIRequestContext,
	options: CreateTestUserOptions = {},
) {
	const email = options.email ?? randomEmail();
	const password = options.password ?? randomPassword();
	const apiBaseUrl = resolveApiBaseUrl(options.apiBaseUrl);

	const response = await request.post(`${apiBaseUrl}/auth/register`, {
		data: {
			email,
			password,
		},
	});

	if (!response.ok()) {
		const payload = await response.json().catch(() => undefined);

		const userAlreadyExists =
			response.status() === 400 &&
			payload?.detail === "REGISTER_USER_ALREADY_EXISTS";

		if (!userAlreadyExists) {
			throw new Error(
				`Failed to create test user (status ${response.status()}): ${JSON.stringify(payload)}`,
			);
		}
	}

	return { email, password };
}

export async function loginViaApi(
	request: APIRequestContext,
	email: string,
	password: string,
	apiBaseUrl?: string,
) {
	const baseUrl = resolveApiBaseUrl(apiBaseUrl);

	const response = await request.post(`${baseUrl}/auth/jwt/login`, {
		form: {
			username: email,
			password,
		},
	});

	if (!response.ok()) {
		const payload = await response.json().catch(() => undefined);
		throw new Error(
			`Failed to login test user (status ${response.status()}): ${JSON.stringify(payload)}`,
		);
	}

	return response.json();
}
