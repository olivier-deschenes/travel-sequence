/* eslint-disable react-refresh/only-export-components */
import { Aisle } from "@/stores/useGridStore";
import { PropsWithChildren, createContext, useContext } from "react";

type State = {
  aisle: Aisle;
  index: number;
};

const Context = createContext<State | undefined>(undefined);

export const useAisleContext = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useAisleContext must be used within an AisleProvider");
  }

  return context;
};

export const AisleProvider = ({
  aisle,
  index,
  children,
}: PropsWithChildren<State>) => {
  return (
    <Context.Provider value={{ aisle, index }}>{children}</Context.Provider>
  );
};
