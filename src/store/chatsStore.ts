import { create } from "zustand";

type State = {
    userId: number | null;
    groupId: number | null;
    caller: User | null;
}

type Actions = {
    setUserId: (userId: number | null) => void;
    setGroupId: (groupId: number | null) => void;
    setCaller: (caller: User | null) => void;
}

export const useChatsStore = create<State & Actions>(
    (set) => ({
        userId: null,
        caller: null,
        groupId: null,
        setUserId: (userId) => set({ userId }),
        setCaller: (caller) => set({ caller }),
        setGroupId: (groupId) => set({ groupId }),
    })
);