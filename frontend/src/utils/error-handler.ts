import { toast } from "sonner";

function getErrorMessage(error: unknown, defaultMessage: string) {
	if (error instanceof Error) {
		return error.message;
	}

	if (typeof error === "string") {
		return error;
	}

	if (error && typeof error === "object" && "detail" in error) {
		const detail = (error as { detail?: unknown }).detail;
		if (typeof detail === "string") {
			return detail;
		}
		if (detail && typeof detail === "object" && "reason" in detail) {
			const reason = (detail as { reason?: unknown }).reason;
			if (Array.isArray(reason)) {
				return reason.join(" ");
			}
			if (typeof reason === "string") {
				return reason;
			}
		}
	}

	return defaultMessage;
}

export const handleApiError = (error: unknown, defaultMessage: string) => {
	const message = getErrorMessage(error, defaultMessage);
	toast.error(message);
	// Add Sentry/Bugsnag logging here
};
