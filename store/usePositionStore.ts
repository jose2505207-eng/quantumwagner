import { create } from "zustand";
import { Position } from "./types/user/postionType";
import { User } from "./types/admin/userInfo";

interface PositionState {
  positions: Position[];

  setPositions: (positions: Position[]) => void;
}

export const usePositionStore = create<PositionState>((set) => ({
  positions: [],
  
  setPositions: (positions) => set({ positions }),
}
));
