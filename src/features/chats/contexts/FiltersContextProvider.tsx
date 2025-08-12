import { createContext, useContext, useReducer } from "react";
import filtersReducer from "../reducers/filtersReducer";

type Props = {
    children: React.ReactNode;
}

const FiltersContext = createContext<FiltersContextType | null>(null);

export const useFiltersContext = () => useContext(FiltersContext);

const initialState = {
    pinned: false,
    starred: false,
    messageType: null,
    search: ""
}

const FiltersContextProvider: React.FC<Props> = ({ children }) => {
    const [state, dispatch] = useReducer(filtersReducer, initialState);
    const isFiltered = !!state.pinned || !!state.starred || !!state.messageType || !!state.search;

    const toggleStarred = () => {
        if (state.starred) {
            dispatch({ type: "SET_STARRED", payload: false });
        }
        else {
            dispatch({ type: "SET_STARRED", payload: true });
        }
    }

    const togglePinned = () => {
        if (state.pinned) {
            dispatch({ type: "SET_PINNED", payload: false });
        }
        else {
            dispatch({ type: "SET_PINNED", payload: true });
        }
    }

    const setSearch = (search: string) => {
        dispatch({ type: "SET_SEARCH", payload: search });
    }

    const resetFilters = () => {
        dispatch({ type: "RESET" });
    }

    const setMessageType = (messageType: MessageType | null) => {
        dispatch({ type: "SET_MESSAGE_TYPE", payload: messageType });
    }

    return (
        <FiltersContext.Provider 
            value={{ 
                pinned: state.pinned, 
                starred: state.starred, 
                search: state.search, 
                messageType: state.messageType,
                isFiltered,
                togglePinned,
                toggleStarred,
                resetFilters,
                setSearch,
                setMessageType
            }}
        >
            {children}
        </FiltersContext.Provider>
    );
}

export default FiltersContextProvider;