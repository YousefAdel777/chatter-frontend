import { createContext, useContext } from "react";
import useMessages from "../hooks/useMessages";

type Props = {
    url: string;
    children: React.ReactNode;
    chatId?: number;
    jumpMessageId?: number;
    disabled?: boolean;
    initialLastMessageId?: number
    forceFetch?: boolean;
}

const MessagesContext = createContext<MessagesContextType | null>(null);

export const useMessagesContext = () => {
    const context = useContext(MessagesContext);
    if (!context) {
        throw new Error("useMessagesContext must be used within a MessagesContextProvider");
    }
    return context;
};

const MessagesContextProvider: React.FC<Props> = ({ children, chatId, url, jumpMessageId, initialLastMessageId, disabled, forceFetch }) => {
    const { dataBeforeJump, messages, paginatedDataAfter, hasMoreAfter, paginatedDataBefore, hasMoreBefore, isError, isLoading, lastMessageId, mutateAfter, mutateBefore, setAfterSize, setBeforeSize } = useMessages(url, 10, initialLastMessageId, chatId, jumpMessageId, disabled, forceFetch);

    return (
        <MessagesContext.Provider value={{
            dataBeforeJump,
            messages, 
            paginatedDataAfter, 
            hasMoreAfter, 
            paginatedDataBefore, 
            hasMoreBefore,
            isError,
            isLoading,
            lastMessageId,
            mutateAfter,
            mutateBefore,
            setAfterSize, 
            setBeforeSize,
        }}>
            {children}
        </MessagesContext.Provider>
    );
}

export default MessagesContextProvider;