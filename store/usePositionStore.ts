import { create } from "zustand";
import { Position } from "@/app/types";

interface PositionState {
  positions: Position[];
  setPositions: (positions: Position[]) => void;
}

export const usePositionStore = create<PositionState>((set) => ({
  positions: [],
  setPositions: (positions) => set({ positions }),
}
));
