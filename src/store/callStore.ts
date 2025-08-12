import { create } from "zustand"

type State = {
    callers: User[];
    callingUser: User | null;
    isCallModalOpen: boolean;
    isCallModalMinimized: boolean;
}

type Actions = {
    addCaller: (user: User) => void;
    removeCaller: (userId: number) => void;
    setCallingUser: (user: User | null) => void;
    setIsCallModalOpen: (isOpen: boolean) => void;
    setIsCallModalMinimized: (isOpen: boolean) => void;
}

export const useCallStore = create<State & Actions>(
    (set) => ({
        callers: [],
        callingUser: null,
        isCallModalOpen: false,
        isCallModalMinimized: false,
        setCallingUser: (user) => set({ callingUser: user }),
        setIsCallModalMinimized: (isMinimized) => set({ isCallModalMinimized: isMinimized }),
        setIsCallModalOpen: (isOpen) => set({ isCallModalOpen: isOpen }),
        addCaller: (user) => {
            set((state) => {
                if (state.callers.some(caller => caller.id === user.id)) {
                    return state;
                }
                return {
                    ...state,
                    callers: [...state.callers, user]
                }
            })
        },
        removeCaller: (userId) => {
            set((state) => {
                return {
                    ...state,
                    callers: state.callers.filter(user => user.id !== userId),
                }
            })
        }
    })
);