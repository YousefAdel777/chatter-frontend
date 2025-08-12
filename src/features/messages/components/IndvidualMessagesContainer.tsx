"use client";

import Loading from "@/features/common/components/Loading";
import useSWR from "swr";
import MessagesContainer from "./MessagesContainer";
import ChatHeader from "./ChatHeader";
import FiltersContextProvider from "@/features/chats/contexts/FiltersContextProvider";
import { useMemo } from "react";

type Props = {
    user: User;
    isBlocked?: boolean;
}

const IndvidualMessagesContainer: React.FC<Props> = ({ user, isBlocked }) => {
    
    const { data: chats, isLoading: isLoadingChats, error: errorChats } = useSWR<Chat[]>(`/api/chats`);
    const chat = useMemo(() => chats?.find(chat => chat.otherUser?.id === user.id), [chats, user.id]);

    return (
        <div className="min-h-svh flex flex-col w-full">
            {
                isLoadingChats ?
                <Loading />
                :
                errorChats ?
                <h2 className="text-2xl text-center font-bold">Something went wrong</h2>
                :
                <FiltersContextProvider>
                    <ChatHeader chatId={chat?.id} user={user} />
                    <MessagesContainer 
                        isBlocked={isBlocked} 
                        chat={chat} 
                        userId={user.id}
                    />
                </FiltersContextProvider>
            }
        </div>
    );
};

export default IndvidualMessagesContainer;