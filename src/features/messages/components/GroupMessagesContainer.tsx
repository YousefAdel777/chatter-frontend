"use client"

import FiltersContextProvider from "@/features/chats/contexts/FiltersContextProvider";
import MessagesContainer from "./MessagesContainer";
import GroupChatHeader from "@/features/groups/components/GroupChatHeader";
import ChatHeader from "./ChatHeader";

type Props = {
    member: Member;
    chat: Chat;
}

const GroupMessagesContainer: React.FC<Props> = ({ member, chat }) => {

    return (
        <div className="min-h-svh flex flex-col w-full">
            <FiltersContextProvider>
                {
                    chat.chatType === "GROUP" ?
                    <GroupChatHeader member={member} chat={chat} />
                    :
                    <ChatHeader user={chat?.otherUser || undefined} />
                }
                <MessagesContainer member={member} chat={chat} />
            </FiltersContextProvider>
        </div>
    );
}

export default GroupMessagesContainer;