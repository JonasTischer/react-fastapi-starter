import { Container } from "@/components/layout/Container";
import backgroundImage from "@/images/background-faqs.jpg";

const faqs = [
	[
		{
			question: "What's in the stack?",
			answer:
				"React + Vite with TanStack Router and Query on the frontend, FastAPI + SQLAlchemy + PostgreSQL on the backend, and a typed client generated from the OpenAPI schema.",
		},
		{
			question: "How does authentication work?",
			answer:
				"fastapi-users with HTTPOnly-cookie JWT auth, password reset, and optional Google OAuth. The frontend never touches the token directly.",
		},
		{
			question: "Do I have to use Docker?",
			answer:
				"No. `just dev` runs everything natively. Docker Compose is provided for a one-command stack and for production-like images.",
		},
	],
	[
		{
			question: "How is the API client kept in sync?",
			answer:
				"A watcher regenerates the typed client from the OpenAPI schema whenever your backend routes change, so the frontend always matches the API.",
		},
		{
			question: "Is it ready for production?",
			answer:
				"It ships hardened production Docker images, rate limiting, security headers, health/readiness probes, and CI — see the Production section of the README.",
		},
		{
			question: "Can I swap the UI library?",
			answer:
				"Yes. It uses shadcn/ui on Tailwind, so components live in your repo and are yours to edit or replace.",
		},
	],
	[
		{
			question: "How do I run the tests?",
			answer:
				"`just test` runs the backend pytest suite and the frontend Vitest unit tests; `just test-e2e` runs the Playwright end-to-end suite.",
		},
		{
			question: "How do migrations work?",
			answer:
				'Alembic. Use `just create-migration MESSAGE="..."` to autogenerate one and `just migrate` to apply it. Production images run migrations on startup.',
		},
		{
			question: "What license is it under?",
			answer:
				"MIT — use it for personal or commercial projects, no strings attached.",
		},
	],
];

export function Faqs() {
	return (
		<section
			id="faq"
			aria-labelledby="faq-title"
			className="relative overflow-hidden bg-slate-50 py-20 sm:py-32"
		>
			<img
				className="absolute top-0 left-1/2 max-w-none translate-x-[-30%] -translate-y-1/4"
				src={backgroundImage}
				alt=""
				width={1558}
				height={946}
			/>
			<Container className="relative">
				<div className="mx-auto max-w-2xl lg:mx-0">
					<h2
						id="faq-title"
						className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl"
					>
						Frequently asked questions
					</h2>
					<p className="mt-4 text-lg tracking-tight text-slate-700">
						If you can’t find what you’re looking for, email our support team
						and if you’re lucky someone will get back to you.
					</p>
				</div>
				<ul
					role="list"
					className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3"
				>
					{faqs.map((column, columnIndex) => (
						<li key={columnIndex}>
							<ul role="list" className="flex flex-col gap-y-8">
								{column.map((faq, faqIndex) => (
									<li key={faqIndex}>
										<h3 className="font-display text-lg/7 text-slate-900">
											{faq.question}
										</h3>
										<p className="mt-4 text-sm text-slate-700">{faq.answer}</p>
									</li>
								))}
							</ul>
						</li>
					))}
				</ul>
			</Container>
		</section>
	);
}
