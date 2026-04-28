import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import clsx from "clsx";
import { Toaster } from "sonner";
import { Providers } from "./providers";

import "./globals.css";
//import '@/styles/tailwind.css'

export const metadata: Metadata = {
	title: {
		template: "%s - NextJS FastAPI",
		default: "NextJS FastAPI - Your NextJS FastAPI Starter Kit",
	},
	description: "Your NextJS FastAPI Starter Kit",
};

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

const lexend = Lexend({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-lexend",
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			data-scroll-behavior="smooth"
			className={clsx(
				"h-full scroll-smooth bg-white antialiased",
				inter.variable,
				lexend.variable,
			)}
		>
			<body>
				<Toaster richColors />
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
