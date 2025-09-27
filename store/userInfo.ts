import { create } from "zustand";
import { UserProfileResponse } from "@/app/types";

interface UserStore {
    userInfo: UserProfileResponse | null;
    setUserInfo: (user: UserProfileResponse) => void;
}

export const useUserStore = create<UserStore>((set) => ({
    userInfo: null,
    setUserInfo: (user) => set({ userInfo: user }),
}));
