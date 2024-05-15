/* eslint-disable react-refresh/only-export-components */
import { Depth } from "@/stores/useGridStore";
import { PropsWithChildren, createContext, useContext } from "react";

type State = {
  depth: Depth;
  index: number;
};

const Context = createContext<State | undefined>(undefined);

export const useDepthContext = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useDepthContext must be used within an AisleProvider");
  }

  return context;
};

export const DepthProvider = ({
  depth,
  index,
  children,
}: PropsWithChildren<State>) => {
  return (
    <Context.Provider value={{ depth: depth, index }}>
      {children}
    </Context.Provider>
  );
};
