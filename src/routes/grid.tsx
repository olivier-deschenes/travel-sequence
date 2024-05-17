import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AisleProvider, useAisleContext } from "@/contexts/AisleContext";
import { CellProvider, useCellContext } from "@/contexts/CellContext";
import { ColumnProvider, useColumnContext } from "@/contexts/ColumnContext";
import { DepthProvider, useDepthContext } from "@/contexts/DepthContext";
import { FloorProvider, useFloorContext } from "@/contexts/FloorContext";
import { useGridStore } from "@/stores/useGridStore";
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	ChevronFirst,
	ChevronLast,
	ChevronLeft,
	ChevronRight,
	Pause,
	Play,
} from "lucide-react";
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
	const setActiveElementIndex = useGridStore((s) => s.setActiveElementIndex);

	const isActive = activeElement?.id === depth.id;

	return (
		<div
			className={twMerge(
				"flex flex-1 bg-purple-500 px-2.5 relative py-1 my-auto justify-start items-start cursor-pointer hover:bg-gray-400",
				isActive ? "bg-red-500" : "",
				activeElementIndex > depth.index ? "bg-gray-500" : "",
			)}
			onClick={() => setActiveElementIndex(depth.index)}
			onKeyDown={() => setActiveElementIndex(depth.index)}
		>
			<span className={"my-auto font-mono"}>{depth.location}</span>
			<div
				className={twMerge(
					"absolute bottom-[120%] flex left-0 justify-center items-center w-full z-30",
					isActive ? "visible" : "invisible",
				)}
			>
				<div
					className={twMerge(
						"bg-red-600 rounded-md text-white p-2.5 z-30",
						isActive ? "visible" : "invisible",
					)}
				>
					<span className={"font-bold"}>*Here*</span>
				</div>
				<div
					className={"bg-red-600 w-4 h-4 bottom-[-0.25rem] rotate-45 absolute"}
				/>
			</div>
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
	const {
		aisle: { leftSided, rightSided },
	} = useAisleContext();

	return (
		<div
			className={twMerge(
				"flex bg-blue-500 justify-start",
				index % 2 === 0 ? "flex-row" : "flex-row-reverse",
				leftSided && "col-start-1",
				rightSided && "col-start-2",
			)}
		>
			<div
				className={twMerge(
					"flex gap-1 flex-1",
					index % 2 === 0 ? "flex-row-reverse" : "flex-row",
				)}
				style={{ display: "flex" }}
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
	const { aisle, index } = useAisleContext();

	return (
		<div className={"flex bg-red-500 flex-col"}>
			<div
				className={
					"w-full flex bg-black text-4xl font-bold text-white justify-center items-center py-10"
				}
			>
				{aisle.value} -{" "}
				{JSON.stringify({
					leftSided: aisle.leftSided,
					rightSided: aisle.rightSided,
					index: index,
				})}
			</div>
			<div className={twMerge("grid p-5 grid-cols-2 gap-1.5")}>
				{aisle.items.map((column, columnIndex) => (
					<ColumnProvider
						key={`column-${column.value}`}
						column={column}
						index={aisle.leftSided ? 0 : aisle.rightSided ? 1 : columnIndex}
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
	const moveAction = useGridStore((s) => s.moveAction);
	const resetActiveElement = useGridStore((s) => s.resetActiveElement);
	const activeElementIndex = useGridStore((s) => s.activeElementIndex);
	const rawGrid = useGridStore((s) => s.rawGrid);

	const activeLocation = rawGrid[activeElementIndex];

	const [intervalMs, setIntervalMs] = useState<number>(500);
	const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

	const startInterval = () => {
		const interval = setInterval(() => {
			moveAction("next");
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
					"flex-col gap-10 fixed bottom-0 flex items-center justify-center w-full z-50"
				}
			>
				<div className={"flex bg-white m-10 p-2.5 rounded-md flex-col gap-2.5"}>
					<div>
						<h3 className={"font-bold text-xl"}>Travel Sequence Tools</h3>
					</div>
					<div>
						<p>
							<span className={"font-bold"}>Active Location:</span>{" "}
							<span className={"font-mono"}>{activeLocation.location}</span>
						</p>
					</div>
					<div className={"flex gap-1.5 justify-center items-center"}>
						<Button onClick={() => moveAction("first")} size={"icon"}>
							<ChevronFirst />
						</Button>
						<Button onClick={() => moveAction("previous")} size={"icon"}>
							<ChevronLeft />
						</Button>
						<Button
							onClick={intervalId ? stopInterval : startInterval}
							size={"icon"}
						>
							{intervalId ? <Pause /> : <Play />}
						</Button>
						<Button onClick={() => moveAction("next")} size={"icon"}>
							<ChevronRight />
						</Button>
						<Button onClick={() => moveAction("last")} size={"icon"}>
							<ChevronLast />
						</Button>
					</div>
					<div className="flex items-center space-x-2 max-w-full">
						<Label>Interval</Label>
						<Input
							type="number"
							min={1}
							max={5000}
							value={intervalMs}
							onChange={onIntervalMsChange}
							className={"flex flex-1"}
						/>
					</div>
					<div>
						<Button
							onClick={resetActiveElement}
							variant={"destructive"}
							className={"w-full"}
						>
							Reset
						</Button>
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
