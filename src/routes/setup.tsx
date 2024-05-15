import { Button } from "@/components/ui/button";
import { GridStore, useGridStore } from "@/stores/useGridStore";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export const Route = createFileRoute("/setup")({
  component: Component,
  beforeLoad: () => {
    const rawGrid = useGridStore.getState().rawGrid;

    if (rawGrid.length === 0) {
      throw redirect({ to: "/" });
    }
  },
});

type DelimiterKey = keyof GridStore["delimiters"] | "END";

function Component() {
  const [activeDelimiter, setActiveDelimiter] = useState<DelimiterKey>("aisle");

  const rawGrid = useGridStore((s) => s.rawGrid);
  const delimiters = useGridStore((s) => s.delimiters);
  const setDelimiter = useGridStore((s) => s.setDelimiter);
  const buildGrid = useGridStore((s) => s.buildGrid);
  const navigate = useNavigate();

  const usedLettersIndexes = Object.values(delimiters).reduce(
    (acc, delimiter) => {
      if (delimiter.startIndex === -1 || delimiter.endIndex === -1) {
        return acc;
      }

      for (let i = delimiter.startIndex; i <= delimiter.endIndex; i++) {
        acc.push(i);
      }

      return acc;
    },
    [] as number[]
  );

  const [selectedLetterIndexes, setSelectedLetterIndexes] = useState<number[]>(
    []
  );

  const handleEnd = () => {
    buildGrid();

    navigate({ to: "/grid" });
  };

  const handleNextDelimiter = () => {
    let nextDelimiter: DelimiterKey;

    if (activeDelimiter === "END") {
      return;
    }

    setDelimiter(activeDelimiter, {
      startIndex: selectedLetterIndexes[0],
      endIndex: selectedLetterIndexes[selectedLetterIndexes.length - 1],
      color: delimiters[activeDelimiter].color,
    });

    setSelectedLetterIndexes([]);

    switch (activeDelimiter) {
      case "aisle":
        nextDelimiter = "column";
        break;
      case "column":
        nextDelimiter = "floor";
        break;
      case "floor":
        nextDelimiter = "cell";
        break;
      case "cell":
        nextDelimiter = "depth";
        break;
      default:
        handleEnd();

        return;
    }

    setActiveDelimiter(nextDelimiter);
  };

  const onLetterClick = (index: number) => {
    const selectedLetterIndex = selectedLetterIndexes.findIndex(
      (i) => i === index
    );

    if (selectedLetterIndex === -1) {
      setSelectedLetterIndexes([...selectedLetterIndexes, index]);
    } else {
      setSelectedLetterIndexes(
        selectedLetterIndexes.filter((i) => i !== index)
      );
    }
  };

  return (
    <div
      className={
        "w-screen h-screen flex bg-black justify-center items-center flex-col gap-2.5"
      }
    >
      <div
        className={"text-white text-6xl"}
      >{`Click on the letters representing the ${activeDelimiter}`}</div>
      <div>
        {rawGrid[0].location.split("").map((char, index) => {
          const isCurrentlySelected = selectedLetterIndexes.includes(index);
          const isAlreadyInADelimiter = usedLettersIndexes.includes(index);

          const delimiter = isAlreadyInADelimiter
            ? Object.values(delimiters).find((delimiter) => {
                if (delimiter.startIndex === -1 || delimiter.endIndex === -1) {
                  return false;
                }

                return (
                  index >= delimiter.startIndex && index <= delimiter.endIndex
                );
              })
            : undefined;

          return (
            <button
              key={index}
              className={twMerge([
                "text-8xl text-white font-bold p-2 bg-gray-900 m-1 rounded-md cursor-pointer",
              ])}
              style={{
                backgroundColor: isCurrentlySelected
                  ? "rgba(255, 255, 255, 0.3)"
                  : delimiter
                    ? delimiter.color
                    : undefined,
              }}
              onClick={() => {
                onLetterClick(index);
              }}
              disabled={isAlreadyInADelimiter}
            >
              {char}
            </button>
          );
        })}
      </div>
      <div>
        <Button
          disabled={!selectedLetterIndexes.length}
          onClick={handleNextDelimiter}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
