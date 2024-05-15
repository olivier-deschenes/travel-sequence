import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AisleProvider, useAisleContext } from "@/contexts/AisleContext";
import { CellProvider, useCellContext } from "@/contexts/CellContext";
import { ColumnProvider, useColumnContext } from "@/contexts/ColumnContext";
import { DepthProvider, useDepthContext } from "@/contexts/DepthContext";
import { FloorProvider, useFloorContext } from "@/contexts/FloorContext";
import { useGridStore } from "@/stores/useGridStore";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export const Route = createFileRoute("/grid")({
	component: GridComponent,
	beforeLoad: () => {
		const grid = useGridStore.getState().grid;

		if (!grid.length) {
			throw redirect({ to: "/" });
		}
	},
});

function DepthComponent() {
	const { depth } = useDepthContext();
	const activeElement = useGridStore((s) => s.activeElement);
	const activeElementIndex = useGridStore((s) => s.activeElementIndex);

	const isActive = activeElement?.id === depth.id;

	return (
		<div
			className={twMerge(
				"flex flex-1 bg-purple-500 px-2.5 py-1 my-auto justify-start items-start",
				isActive ? "bg-red-500" : "",
				activeElementIndex > depth.index ? "bg-gray-500" : "",
			)}
		>
			<span className={"my-auto"}>{depth.location}</span>
		</div>
	);
}

function CellComponent() {
	const { index: columnIndex } = useColumnContext();
	const { cell } = useCellContext();

	return (
		<div
			className={twMerge(
				"flex flex-row bg-orange-500 group",
				columnIndex % 2 === 0 ? "flex-row-reverse" : "flex-row",
			)}
		>
			<div
				className={
					"flex justify-center items-center font-bold p-2 border border-black group-last:border-t-0 border-l-0"
				}
			>
				{cell.value}
			</div>
			<div
				className={
					"flex flex-col divide-y divide-black border border-black group-last:border-t-0"
				}
			>
				{cell.items.map((depth, depthIndex) => (
					<DepthProvider key={depth.id} depth={depth} index={depthIndex}>
						<DepthComponent />
					</DepthProvider>
				))}
			</div>
		</div>
	);
}

function FloorComponent() {
	const { floor } = useFloorContext();

	return (
		<div className={twMerge("flex flex-col bg-green-500")}>
			<div className={"flex justify-center font-bold p-1.5"}>{floor.value}</div>
			<div className={twMerge("flex flex-col")}>
				{floor.items.map((cell, cellIndex) => (
					<CellProvider key={cell.id} cell={cell} index={cellIndex}>
						<CellComponent />
					</CellProvider>
				))}
			</div>
		</div>
	);
}

function ColumnComponent() {
	const { column, index } = useColumnContext();

	return (
		<div
			className={twMerge(
				"flex bg-blue-500 justify-start",
				index % 2 === 0 ? "flex-row" : "flex-row-reverse",
			)}
		>
			<div
				className={twMerge(
					"flex gap-1 flex-1",
					index % 2 === 0 ? "flex-row-reverse" : "flex-row",
				)}
			>
				{column.items.map((floor, floorIndex) => (
					<FloorProvider
						key={`floor-${floor.value}`}
						floor={floor}
						index={floorIndex}
					>
						<FloorComponent />
					</FloorProvider>
				))}
			</div>
			<div className={"flex font-bold items-center p-2.5"}>{column.value}</div>
		</div>
	);
}

function AisleComponent() {
	const { aisle } = useAisleContext();

	return (
		<div className={"flex bg-red-500 flex-col"}>
			{aisle.value}
			<div className={"grid p-5 grid-cols-2 gap-1.5"}>
				{aisle.items.map((column, columnIndex) => (
					<ColumnProvider
						key={`column-${column.value}`}
						column={column}
						index={columnIndex}
					>
						<ColumnComponent />
					</ColumnProvider>
				))}
			</div>
		</div>
	);
}

function GridComponent() {
	const grid = useGridStore((s) => s.grid);
	const nextElement = useGridStore((s) => s.nextElement);
	const resetActiveElement = useGridStore((s) => s.resetActiveElement);
	const activeElement = useGridStore((s) => s.activeElement);

	const [intervalMs, setIntervalMs] = useState<number>(500);
	const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

	const startInterval = () => {
		const interval = setInterval(() => {
			nextElement();
		}, intervalMs);

		setIntervalId(interval);
	};

	const stopInterval = () => {
		if (intervalId) {
			clearInterval(intervalId);
			setIntervalId(null);
		}
	};

	const onIntervalMsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number(e.target.value);

		setIntervalMs(value);

		stopInterval();
		setIntervalMs(value);
	};

	return (
		<div className={"flex flex-col gap-10 bg-black min-w-fit relative"}>
			<div
				className={
					"flex-col gap-10 fixed bottom-0 flex items-center justify-center w-full"
				}
			>
				<div className={"flex bg-white m-10 p-10 rounded-md flex-col"}>
					<div className={"flex gap-5"}>
						<Button onClick={nextElement}>Next</Button>
						<Button onClick={resetActiveElement}>Reset</Button>
					</div>
					<div>
						<Input
							type="number"
							min={1}
							max={5000}
							value={intervalMs}
							onChange={onIntervalMsChange}
						/>
						<div>
							<Button onClick={intervalId ? stopInterval : startInterval}>
								{intervalId ? "Stop" : "Start"}
							</Button>
						</div>
					</div>
				</div>
			</div>
			<div className={"flex gap-10"}>
				{grid.map((aisle, index) => (
					<AisleProvider
						key={`aisle-${aisle.value}`}
						aisle={aisle}
						index={index}
					>
						<AisleComponent />
					</AisleProvider>
				))}
			</div>
		</div>
	);
}
