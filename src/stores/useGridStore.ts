import { locations } from "@/defaultLocations";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {} from "@redux-devtools/extension"; // required for devtools typing

export type Element = {
  id: string;
  travelSequence: number;
};

export type Depth = {
  value: string;
  location: string;
  index: number;
} & Element;

export type Cell = {
  value: string;
  items: Depth[];
} & Element;

export type Floor = {
  value: string;
  items: Cell[];
} & Element;

export type Column = {
  value: string;
  items: Floor[];
} & Element;

export type RawGridItem = {
  location: string;
  travelSequence: number;
  id: string;
};

export type Aisle = {
  value: string;
  items: Column[];
  rightSided: boolean;
  leftSided: boolean;
} & Element;

export type Grid = Aisle[];

export type GridState = {
  rawGrid: RawGridItem[];

  activeElementIndex: number;
  activeElement: Element | null;

  grid: Grid;
  aisles: string[];

  delimiters: {
    aisle: Delimiter;
    column: Delimiter;
    floor: Delimiter;
    cell: Delimiter;
    depth: Delimiter;
  };
};

export type GridStore = {
  setGrid: (grid: Grid) => void;
  setAisles: (aisles: string[]) => void;
  setRawGrid: (rawGrid: RawGridItem[]) => void;
  setDelimiter: (
    key: keyof GridStore["delimiters"],
    delimiter: Delimiter
  ) => void;

  buildGrid: () => void;
  resetState: () => void;

  setActiveElementIndex: (index: number) => void;

  getActiveElement: () => Element["id"];

  moveAction: (direction: "first" | "previous" | "next" | "last") => void;

  resetActiveElement: () => void;
} & GridState;

export type Delimiter = {
  startIndex: number;
  endIndex: number;
  color: string;
};

const defaultState: GridState = {
  grid: [],
  aisles: [],
  rawGrid: [],
  delimiters: {
    aisle: { startIndex: -1, endIndex: -1, color: "red" },
    column: { startIndex: -1, endIndex: -1, color: "blue" },
    floor: { startIndex: -1, endIndex: -1, color: "green" },
    cell: { startIndex: -1, endIndex: -1, color: "orange" },
    depth: { startIndex: -1, endIndex: -1, color: "purple" },
  },
  activeElementIndex: 0,
  activeElement: null,
};

const getLastTravelSequence = (elements: Element[]) => {
  return elements.reduce((acc, element) => {
    return element.travelSequence > acc ? element.travelSequence : acc;
  }, -1);
};

export const useGridStore = create<GridStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...defaultState,
        locations: locations,

        getActiveElement: () => {
          const { activeElementIndex, grid } = get();
          const element = grid[activeElementIndex];

          return element.id;
        },
        resetActiveElement: () => {
          set({ activeElementIndex: 0, activeElement: get().rawGrid[0] });
        },

        setActiveElementIndex: (index) => {
          set((state) => {
            if (index === state.activeElementIndex) {
              return {
                activeElementIndex: 0,
                activeElement: state.rawGrid[0],
              };
            }

            const activeElement = state.rawGrid[index];

            return { activeElementIndex: index, activeElement };
          });
        },

        moveAction: (direction) => {
          switch (direction) {
            case "first":
              set((prev) => ({
                activeElementIndex: 0,
                activeElement: prev.rawGrid[0],
              }));
              break;
            case "previous":
              set((state) => {
                const index = Math.max(state.activeElementIndex - 1, 0);
                const activeElement = state.rawGrid[index];

                return { activeElementIndex: index, activeElement };
              });
              break;
            case "next":
              set((state) => {
                const index = Math.min(
                  state.activeElementIndex + 1,
                  state.rawGrid.length - 1
                );
                const activeElement = state.rawGrid[index];

                return { activeElementIndex: index, activeElement };
              });
              break;
            case "last":
              set((prev) => ({
                activeElementIndex: prev.rawGrid.length - 1,
                activeElement: prev.rawGrid[prev.rawGrid.length - 1],
              }));
              break;
          }
        },

        setGrid: (grid) => set({ grid }),
        setAisles: (aisles) => set({ aisles }),
        setRawGrid: (rawGrid) => set({ rawGrid }),
        setDelimiter: (key, delimiter) =>
          set((state) => ({
            delimiters: {
              ...state.delimiters,
              [key]: delimiter,
            },
          })),

        resetState: () => set({ ...defaultState }),

        buildGrid: () => {
          const getSubString = (
            location: string,
            delimiter: keyof GridStore["delimiters"]
          ) => {
            const { startIndex, endIndex } = get().delimiters[delimiter];
            return location.substring(startIndex, endIndex + 1);
          };

          const { rawGrid } = get();

          const grid = rawGrid
            .reduce(
              (acc, { location, travelSequence, id }, index) => {
                const aisle = getSubString(location, "aisle");
                const column = getSubString(location, "column");
                const floor = getSubString(location, "floor");
                const cell = getSubString(location, "cell");
                const depth = getSubString(location, "depth");

                if (!acc.find((a) => a.value === aisle)) {
                  acc.push({
                    value: aisle,
                    items: [],
                    id: crypto.randomUUID(),
                    travelSequence: -1,
                    leftSided: false,
                    rightSided: false,
                  });

                  acc.sort();
                }
                const gridAisle = acc.find((a) => a.value === aisle)!;

                if (!gridAisle.items.find((a) => a.value === column)) {
                  gridAisle.items.push({
                    value: column,
                    items: [],
                    id: crypto.randomUUID(),
                    travelSequence: -1,
                  });

                  gridAisle.items.sort();
                }
                const gridColumn = gridAisle.items.find(
                  (a) => a.value === column
                )!;

                if (!gridColumn.items.find((f) => f.value === floor)) {
                  gridColumn.items.push({
                    value: floor,
                    items: [],
                    id: crypto.randomUUID(),
                    travelSequence: -1,
                  });

                  gridColumn.items.sort();
                }
                const gridFloor = gridColumn.items.find(
                  (f) => f.value === floor
                )!;

                if (!gridFloor.items.find((c) => c.value === cell)) {
                  gridFloor.items.push({
                    value: cell,
                    items: [],
                    id: crypto.randomUUID(),
                    travelSequence: -1,
                  });

                  gridFloor.items.sort();
                }
                const gridCell = gridFloor.items.find((c) => c.value === cell)!;

                if (!gridCell.items.find((d) => d.value === depth)) {
                  gridCell.items.push({
                    value: depth,
                    location,
                    id: id,
                    travelSequence: travelSequence,
                    index,
                  });

                  gridCell.items.sort();
                }

                gridCell.value = cell;
                gridFloor.value = floor;
                gridColumn.value = column;

                return acc;
              },
              [] as GridStore["grid"]
            )
            .map((ailse) => {
              const columns = ailse.items.map((column) => {
                const floors = column.items.map((floor) => {
                  const cells = floor.items.map((cell) => ({
                    ...cell,
                    travelSequence: getLastTravelSequence(cell.items),
                  }));

                  return {
                    ...floor,
                    travelSequence: getLastTravelSequence(cells),
                    items: cells,
                  };
                });

                return {
                  ...column,
                  travelSequence: getLastTravelSequence(floors),
                  items: floors,
                };
              });

              return {
                ...ailse,
                travelSequence: getLastTravelSequence(columns),
                items: columns,
                leftSided: columns.every(
                  (column) => Number(column.value) % 2 === 0
                ),
                rightSided: columns.every(
                  (column) => Number(column.value) % 2 !== 0
                ),
              };
            });

          set({ grid });
        },
      }),
      {
        name: "grid",
      }
    )
  )
);
