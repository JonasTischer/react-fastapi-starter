import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	useCreateItem,
	useDeleteItem,
} from "@/tanstack/features/items/mutations";
import { useItems } from "@/tanstack/features/items/queries";

export const Route = createFileRoute("/_authenticated/items")({
	component: ItemsPage,
});

function ItemsPage() {
	const { data: items, isLoading } = useItems();
	const createItem = useCreateItem();
	const deleteItem = useDeleteItem();

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [quantity, setQuantity] = useState("");

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;
		createItem.mutate(
			{
				body: {
					name: name.trim(),
					description: description.trim() || null,
					quantity: quantity ? Number(quantity) : null,
				},
			},
			{
				onSuccess: () => {
					setName("");
					setDescription("");
					setQuantity("");
				},
			},
		);
	};

	return (
		<div className="flex flex-1 flex-col gap-6 p-6">
			<div>
				<h1 className="text-2xl font-semibold">Items</h1>
				<p className="text-sm text-muted-foreground">
					An example resource showing the full stack: SQLAlchemy model → FastAPI
					route → generated client → tanstack-query.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>New item</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-3">
						<div className="grid gap-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="quantity">Quantity</Label>
							<Input
								id="quantity"
								type="number"
								min={0}
								value={quantity}
								onChange={(e) => setQuantity(e.target.value)}
							/>
						</div>
						<div className="grid gap-2 md:col-span-3">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={2}
							/>
						</div>
						<div className="md:col-span-3">
							<Button type="submit" disabled={createItem.isPending}>
								{createItem.isPending ? "Creating…" : "Create item"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
				{items?.length === 0 && (
					<p className="text-sm text-muted-foreground">
						No items yet. Create one above.
					</p>
				)}
				{items?.map((item) => (
					<Card key={item.id}>
						<CardHeader>
							<CardTitle className="flex items-center justify-between gap-2">
								<span>{item.name}</span>
								{item.quantity != null && (
									<span className="text-sm text-muted-foreground">
										×{item.quantity}
									</span>
								)}
							</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col gap-3">
							{item.description && (
								<p className="text-sm text-muted-foreground">
									{item.description}
								</p>
							)}
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									deleteItem.mutate({ path: { item_id: item.id } })
								}
								disabled={deleteItem.isPending}
							>
								Delete
							</Button>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
