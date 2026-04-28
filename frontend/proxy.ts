import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/items", "/settings", "/profile"];

export function proxy(request: NextRequest) {
	const { pathname, search } = request.nextUrl;

	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route),
	);

	if (isProtectedRoute) {
		const authCookie = request.cookies.get("access_token");

		if (!authCookie) {
			const loginUrl = new URL("/login", request.url);
			loginUrl.searchParams.set("redirect", `${pathname}${search}`);
			return NextResponse.redirect(loginUrl);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/dashboard/:path*",
		"/items/:path*",
		"/settings/:path*",
		"/profile/:path*",
	],
};
