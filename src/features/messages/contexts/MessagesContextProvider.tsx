import { createContext, useContext } from "react";
import useMessages from "../hooks/useMessages";

type Props = {
    url: string;
    children: React.ReactNode;
    jumpMessageId?: number;
    disabled?: boolean;
}

const MessagesContext = createContext<MessagesContextType | null>(null);

export const useMessagesContext = () => useContext(MessagesContext);

const MessagesContextProvider: React.FC<Props> = ({ children, url, jumpMessageId, disabled }) => {
    const { dataBeforeJump, messages, paginatedDataAfter, hasMoreAfter, paginatedDataBefore, hasMoreBefore, mutateAfter, mutateBefore, isError, isLoading, setAfterSize, setBeforeSize } = useMessages(url, 10, jumpMessageId, disabled);

    return (
        <MessagesContext.Provider value={{
            dataBeforeJump,
            messages, 
            paginatedDataAfter, 
            hasMoreAfter, 
            paginatedDataBefore, 
            hasMoreBefore, 
            mutateAfter, 
            mutateBefore, 
            isError, 
            isLoading, 
            setAfterSize, 
            setBeforeSize
        }}>
            {children}
        </MessagesContext.Provider>
    );
}

export default MessagesContextProvider;