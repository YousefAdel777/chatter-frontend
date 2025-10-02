"use client";

import Avatar from "@/features/common/components/Avatar";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import useOnlineStatus from "../hooks/useOnlineStatus";
import ChatLastMessage from "./ChatLastMessage";
import useTypingUsers from "@/features/messages/hooks/useTypingUsers";
import { GoMention } from "react-icons/go";

type Props = {
    chat: Chat;
    disabled?: boolean;
}

const Chat: React.FC<Props> = ({ chat, disabled }) => {

    const pathname = usePathname();
    const { otherUser } = chat;
    const router = useRouter();
    const { isOnline } = useOnlineStatus(otherUser?.id);
    const isCurrentChat = pathname === `/chats/${chat.id}` || pathname === `/chats?userId=${otherUser?.id}`;
    const { typingUsernames, typingUsers } = useTypingUsers(chat.id);

    const selectChat = () => {
        if (disabled) return;
        const searchParams = new URLSearchParams();
        if (chat.firstUnreadMessageId) {
            searchParams.append("messageId", chat.firstUnreadMessageId.toString());
        }
        router.push(`/chats/${chat.id}?${searchParams.toString()}`);
    }

    return (
        <div onClick={selectChat} className={clsx("flex flex-1 items-center px-3 py-2 rounded-md gap-3 duration-200", {
            "bg-background-secondary": !disabled && isCurrentChat,
            "cursor-pointer hover:bg-background-secondary": !disabled
        })}>
            <Avatar isOnline={isOnline} alt={chat.name || otherUser?.username || "Deleted user"} image={chat.image || otherUser?.image || "/user_image.webp"}  />
            <div className="flex-1">
                <h2 className="text-lg max-w-48 font-semibold truncate">{chat.name || otherUser?.username || "Deleted user"}</h2>
                {
                    typingUsernames.length > 0 ?
                    <p className="text-xs max-w-48 font-semibold truncate text-primary">{chat.chatType === "INDIVIDUAL" ? "Typing..." : `${typingUsernames} ${typingUsers.length === 1 ? "is" : "are"} typing...`}</p>
                    :
                    chat.lastMessage ?
                    <ChatLastMessage message={chat.lastMessage} />
                    :
                    null
                }
            </div>
            <div className="flex items-center justify-center flex-col gap-1.5">
                {
                    chat.isMentioned &&
                    <GoMention size={18} className="text-primary" />
                }
                {
                    chat.unreadMessagesCount > 0 &&
                    <div className="rounded-full ml-auto text-xs text-white flex items-center justify-center font-semibold min-w-5 min-h-5 bg-primary">
                        {chat.unreadMessagesCount}
                    </div>
                }
            </div>
        </div>
    );
}

export default Chat;