/* eslint-disable react-refresh/only-export-components */
import { Floor } from "@/stores/useGridStore";
import { PropsWithChildren, createContext, useContext } from "react";

type State = {
  floor: Floor;
  index: number;
};

const Context = createContext<State | undefined>(undefined);

export const useFloorContext = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useFloorContext must be used within an AisleProvider");
  }

  return context;
};

export const FloorProvider = ({
  floor,
  index,
  children,
}: PropsWithChildren<State>) => {
  return (
    <Context.Provider value={{ floor: floor, index }}>
      {children}
    </Context.Provider>
  );
};
