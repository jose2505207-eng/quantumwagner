import { create } from "zustand";
import { User } from "./types/admin/userInfo";
import { Market } from "@/app/types";

interface MarketStore {
    markets: Market[];
    allUsersInfo: User[]
    setAllUserInfo: (user: User[]) => void
    setMarkets: (markets: Market[]) => void
}


export const useMarketStore = create<MarketStore>((set) => ({
    markets: [],
    allUsersInfo: [],

    setAllUserInfo: (user) => set({ allUsersInfo: user }),
    setMarkets: (markets) => set({ markets })
}))