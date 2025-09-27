import { create } from "zustand";
import { Market } from "@/app/types";

interface MarketStore {
    markets: Market[];
    setMarkets: (markets: Market[]) => void;
}

export const useMarketStore = create<MarketStore>((set) => ({
    markets: [],
    setMarkets: (markets) => set({ markets }),
}));
