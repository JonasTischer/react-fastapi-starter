import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

import { SectionCards } from "@/components/section-cards";
import { Skeleton } from "@/components/ui/skeleton";
import data from "@/data/dashboard.json";

// Lazy-load the heavy bits (recharts / tanstack-table) so they're split out of
// the initial dashboard bundle and stream in behind a skeleton.
const ChartAreaInteractive = lazy(() =>
	import("@/components/chart-area-interactive").then((m) => ({
		default: m.ChartAreaInteractive,
	})),
);
const DataTable = lazy(() =>
	import("@/components/data-table").then((m) => ({ default: m.DataTable })),
);

export const Route = createFileRoute("/_authenticated/dashboard")({
	component: DashboardPage,
});

function DashboardPage() {
	return (
		<div className="flex flex-1 flex-col">
			<div className="@container/main flex flex-1 flex-col gap-2">
				<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
					<SectionCards />
					<div className="px-4 lg:px-6">
						<Suspense fallback={<Skeleton className="h-[250px] w-full" />}>
							<ChartAreaInteractive />
						</Suspense>
					</div>
					<Suspense fallback={<Skeleton className="mx-4 h-[400px] lg:mx-6" />}>
						<DataTable data={data} />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
