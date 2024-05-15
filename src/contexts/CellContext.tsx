/* eslint-disable react-refresh/only-export-components */
import { Cell } from "@/stores/useGridStore";
import { PropsWithChildren, createContext, useContext } from "react";

type State = {
  cell: Cell;
  index: number;
};

const Context = createContext<State | undefined>(undefined);

export const useCellContext = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useCellContext must be used within an AisleProvider");
  }

  return context;
};

export const CellProvider = ({
  cell,
  index,
  children,
}: PropsWithChildren<State>) => {
  return (
    <Context.Provider value={{ cell: cell, index }}>
      {children}
    </Context.Provider>
  );
};
