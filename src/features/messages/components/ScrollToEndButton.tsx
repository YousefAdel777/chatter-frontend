import { useStompContext } from "@/features/common/contexts/StompContextProvider";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { HiOutlineChevronDoubleDown } from "react-icons/hi2";
import { markChatMessagesAsRead } from "../actions";

type Props = {
    chatId?: number;
    viewedMessagesIds: Set<number>;
    handleJump: () => void;
    addViewedMessagesIds: (messagesIds: number[]) => void;
}

const ScrollToEndButton: React.FC<Props> = ({ chatId, viewedMessagesIds, handleJump, addViewedMessagesIds }) => {

    const { getClient } = useStompContext();
    const { data: session } = useSession();
    const [newMessagesIds, setNewMessagesIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        const stompClient = getClient();
        if (!session?.user?.accessToken || !chatId || !stompClient?.connected) return;

        stompClient.subscribe(`/topic/chat.${chatId}.created-messages`, (message) => {            
            const newMessage: Message = JSON.parse(message.body);
            if (newMessage.user?.id.toString() === session?.user?.id) return;
            setNewMessagesIds(prev => new Set([...prev, newMessage.id]));
        });

        stompClient.subscribe(`/topic/chat.${chatId}.deleted-messages`, (message) => {            
            const deletedMessageId = JSON.parse(message.body);
            setNewMessagesIds(prev => new Set([...prev].filter(id => id !== deletedMessageId)));
        });

    }, [chatId, session?.user?.id, session?.user?.accessToken, getClient]);

    const newMessagesCount = useMemo(() => {
        return [...newMessagesIds].filter(messageId => {
            return !viewedMessagesIds.has(messageId);
        }).length;
    }, [newMessagesIds, viewedMessagesIds]);

    const handleClick = () => {
        if (chatId) markChatMessagesAsRead(chatId);
        handleJump();
        addViewedMessagesIds([...newMessagesIds]);
        setNewMessagesIds(new Set());
    }

    return (
        <button onClick={handleClick} className="w-10 h-10 flex items-center justify-center rounded-full bg-background border-border-primary hover:bg-background-ternary duration-200 absolute shadow-md right-8 bottom-8">
            <HiOutlineChevronDoubleDown size={20} className="text-primary" />
            {
                newMessagesCount > 0 &&
                <span className="text-xs font-semibold flex items-center justify-center text-white bg-primary w-6 h-6 rounded-full absolute -right-2 -top-2">
                    {newMessagesCount}
                </span>
            }
        </button>
    );
}

export default ScrollToEndButton;