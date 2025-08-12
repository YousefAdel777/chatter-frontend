"use client";

import ChatInput from "./ChatInput";
import useDebounce from "@/features/search/hooks/useDebounce";
import { useFiltersContext } from "@/features/chats/contexts/FiltersContextProvider";
import MessagesContextProvider from "../contexts/MessagesContextProvider";
import GroupedMessages from "./GroupedMessages";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

type Props = {
    chat?: Chat;
    userId?: number;
    isBlocked?: boolean;
    member?: Member;
}

const MessagesContainer: React.FC<Props> = ({ chat, member, userId, isBlocked }) => {

    const [replyMessage, setReplyMessage] = useState<Message | null>(null);
    const [editedMessage, setEditedMessage] = useState<Message | null>(null);
    const { search, starred, pinned, messageType } = useFiltersContext() as FiltersContextType;
    const { debouncedValue: debouncedSearch } = useDebounce(search);
    const isAdmin = member?.memberRole === "ADMIN" || member?.memberRole === "OWNER";
    const searchParams = useSearchParams();
    const messageId = searchParams.get("messageId");

    const unselectMessage = () => {
        setReplyMessage(null);
        setEditedMessage(null);
    }

    return (
        <MessagesContextProvider 
            disabled={!chat?.id}
            jumpMessageId={messageId ? Number.parseInt(messageId) : undefined}
            url={`/api/messages?chatId=${chat?.id}&search=${debouncedSearch}&pinned=${pinned || ""}&starred=${starred || ""}&messageType=${messageType || ""}`}
        >
            <div className="relative flex-1">
                <GroupedMessages member={member} chat={chat} setReplyMessage={setReplyMessage} setEditedMessage={setEditedMessage} />
                {
                    isBlocked || (chat?.chatType === "INDIVIDUAL" && !chat.otherUser) ?
                    <div className="absolute bottom-0 w-full flex items-center justify-center py-5 bg-background-secondary">
                        <p className="text-primary text-sm font-bold">
                            User Unavailable
                        </p>
                    </div>
                    :
                    chat?.onlyAdminsCanSend && !isAdmin ?
                    <div className="absolute bottom-0 w-full flex items-center justify-center py-5 bg-background-secondary">
                        <p className="text-primary text-sm font-bold">
                            Only admins can send messages
                        </p>
                    </div>
                    :
                    <ChatInput
                        chatId={chat?.id}
                        userId={userId}
                        editedMessage={editedMessage} 
                        replyMessage={replyMessage}
                        unselectMessage={unselectMessage}
                    />
                }
            </div>
        </MessagesContextProvider>
    );
}

export default MessagesContainer;