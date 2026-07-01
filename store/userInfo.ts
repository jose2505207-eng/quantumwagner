import { create } from "zustand";
import { UserProfileResponse } from "./types/user/userInfoType";

interface UserStore {
    userInfo: UserProfileResponse | null;
    setUserInfo: (user: UserProfileResponse) => void;
    clearUserInfo: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
    userInfo: null,
    setUserInfo: (user) => set({ userInfo: user }),
    clearUserInfo: () => set({ userInfo: null }),
}));
