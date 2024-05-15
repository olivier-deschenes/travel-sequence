import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { type GridStore, useGridStore } from "../stores/useGridStore";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
	component: Component,
	beforeLoad: () => {
		useGridStore.getState().resetState();
	},
});

function Component() {
	const navigate = useNavigate();
	const setRawGrid = useGridStore((s) => s.setRawGrid);

	const [inputValue, setInputValue] = useState<string>("");

	const handleOnChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInputValue(e.target.value);
	};

	const handleOnNext = () => {
		const lines = inputValue.split("\n").reduce(
			(acc, line) => {
				const [location, travelSequence] = line.split("\t");

				if (!location || !travelSequence) return acc;

				acc.push({
					location,
					travelSequence: Number(travelSequence),
					id: crypto.randomUUID(),
				});

				return acc;
			},
			[] as GridStore["rawGrid"],
		);
		setRawGrid(lines.sort((a, b) => a.travelSequence - b.travelSequence));

		navigate({ to: "/setup" });
	};

	return (
		<div
			className={
				"w-screen h-screen flex bg-black justify-center items-center flex-col text-white gap-5"
			}
		>
			<div
				className={
					"container mx-auto flex justify-center items-start flex-col gap-5"
				}
			>
				<textarea
					className={"w-full h-96 text-wite bg-gray-800 text-xl p-5 rounded-md"}
					onChange={handleOnChange}
					value={inputValue}
				/>
				<div className={"flex ml-auto"}>
					<Button onClick={handleOnNext} disabled={!inputValue}>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
