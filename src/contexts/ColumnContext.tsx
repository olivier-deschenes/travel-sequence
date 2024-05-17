/* eslint-disable react-refresh/only-export-components */
import type { Column } from "@/stores/useGridStore";
import { type PropsWithChildren, createContext, useContext } from "react";

type State = {
	column: Column;
	index: number;
};

const Context = createContext<State | undefined>(undefined);

export const useColumnContext = () => {
	const context = useContext(Context);

	if (!context) {
		throw new Error("useColumnContext must be used within an AisleProvider");
	}

	return context;
};

export const ColumnProvider = ({
	column,
	index,
	children,
}: PropsWithChildren<State>) => {
	return (
		<Context.Provider value={{ column, index }}>{children}</Context.Provider>
	);
};
