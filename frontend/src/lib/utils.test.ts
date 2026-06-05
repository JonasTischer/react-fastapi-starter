import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
	it("joins truthy class names and drops falsy ones", () => {
		expect(cn("a", false && "b", undefined, "c")).toBe("a c");
	});

	it("resolves conflicting tailwind classes so the last one wins", () => {
		expect(cn("p-2", "p-4")).toBe("p-4");
	});
});
