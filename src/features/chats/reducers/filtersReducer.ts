type ChatFiltersState = {
    pinned: boolean;
    starred: boolean;
    messageType: MessageType | null;
    search: string;
}

type Action = { type: "RESET" }
| { type: "SET_PINNED"; payload: boolean }
| { type: "SET_STARRED"; payload: boolean }
| { type: "SET_MESSAGE_TYPE"; payload: MessageType | null }
| { type: "SET_SEARCH"; payload: string };

const filtersReducer = (state: ChatFiltersState, action: Action) => {
    switch(action.type) {
        case "RESET":
            return {
                pinned: false,
                starred: false,
                messageType: null,
                search: "",
            }
        case "SET_PINNED": 
            return { ...state, pinned: action.payload }
        case "SET_STARRED":
            return { ...state, starred: action.payload };
        case "SET_MESSAGE_TYPE": 
            return { ...state, messageType: action.payload };
        case "SET_SEARCH": 
            return { ...state, search: action.payload };
        default:
            return state;
    }
}

export default filtersReducer;