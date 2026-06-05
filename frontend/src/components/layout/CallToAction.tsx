import { Button } from "@/components/layout/Button";
import { Container } from "@/components/layout/Container";
import backgroundImage from "@/images/background-call-to-action.jpg";

export function CallToAction() {
	return (
		<section
			id="get-started-today"
			className="relative overflow-hidden bg-blue-600 py-32"
		>
			<img
				className="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
				src={backgroundImage}
				alt=""
				width={2347}
				height={1244}
			/>
			<Container className="relative">
				<div className="mx-auto max-w-lg text-center">
					<h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
						Start building today
					</h2>
					<p className="mt-4 text-lg tracking-tight text-white">
						Clone the template, run <code>just dev</code>, and you’ve got auth,
						a typed API client, and a dashboard running locally in minutes.
					</p>
					<Button href="/register" color="white" className="mt-10">
						Get started
					</Button>
				</div>
			</Container>
		</section>
	);
}
