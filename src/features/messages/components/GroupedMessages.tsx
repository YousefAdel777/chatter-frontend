import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Message from "./Message";
import Loading from "@/features/common/components/Loading";
import NoMessages from "./NoMessages";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { useMessagesContext } from "../contexts/MessagesContextProvider";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { formatDate } from "@/features/common/lib/utils";
import { batchCreateMessageReads } from "../actions";
import ScrollToEndButton from "./ScrollToEndButton";

type Props = {
    chat?: Chat;
    member?: Member;
    setReplyMessage: (message: Message) => void;
    setEditedMessage: (message: Message) => void;
}

type GroupedMessageItem = 
    | { type: 'date-header'; date: string; }
    | { type: 'message'; data: Message };

const GroupedMessages: React.FC<Props> = ({ chat, member, setReplyMessage, setEditedMessage }) => {

    const virtuosoRef = useRef<VirtuosoHandle>(null);
    // const virtuosoRef = useRef<GroupedVirtuosoHandle>(null);
    const timeoutRefAfter = useRef<NodeJS.Timeout | null>(null);
    const timeoutRefBefore = useRef<NodeJS.Timeout | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const messageId = searchParams.get("messageId");
    const [highlightedMessageId, setHighlightedMessageId] = useState<Message["id"] | null>(null);
    const [firstUnreadId, setFirstUnreadId] = useState<Message["id"] | null>(null);
    const [viewedMessagesIdsToRead, setViewedMessagesIdsToRead] = useState<Set<number>>(new Set());
    const [viewedMessagesIds, setViewedMessagesIds] = useState<Set<number>>(new Set());
    const { lastMessageId, dataBeforeJump, messages, hasMoreAfter, hasMoreBefore, isLoading, isError, setAfterSize, setBeforeSize } = useMessagesContext();
    const [showScrollToEndButton, setShowScrollToEndButton] = useState(false);
    const endReached = useMemo(() => lastMessageId && messages.length && lastMessageId === messages[messages.length - 1].id, [lastMessageId, messages]);

    const groupMessagesByDate = useCallback((data: Message[]) => {
        return data.reduce((acc: GroupedMessageItem[], message, index) => {
            const currentDate = formatDate(message.createdAt);
            const prevDate = index > 0 ? formatDate(data[index - 1]?.createdAt) : null;
            
            if (currentDate !== prevDate) {
                acc.push({ type: 'date-header', date: currentDate });
            }
            
            acc.push({ type: 'message', data: message });
            return acc;
        }, []);
    }, []);

    const groupedMessages = useMemo(() => {
        const data = dataBeforeJump?.flatMap(page => page.content);
        return isLoading && data?.length ? groupMessagesByDate(data) : groupMessagesByDate(messages);
    }, [messages, isLoading, dataBeforeJump, groupMessagesByDate]);

    const messageIndex = useMemo(() => {
        if (messageId) {
            const index = groupedMessages.findIndex(message => message.type === "message" && message.data.id.toString() === messageId);
            return index !== -1 ? index : null;
        }
        return null;
    }, [messageId, groupedMessages]);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (chat?.firstUnreadMessageId) {
            setFirstUnreadId(chat?.firstUnreadMessageId);
            timeout = setTimeout(() => {
                setFirstUnreadId(null);
            }, 3000);
        }
        return () => clearTimeout(timeout);
    }, [chat?.firstUnreadMessageId]);

    const loadMoreAfter = useCallback(() => {
        if (!hasMoreAfter || timeoutRefAfter.current) return;
        timeoutRefAfter.current = setTimeout(() => {
            setAfterSize(prev => prev + 1);
            timeoutRefAfter.current = null;
        }, 500);
    }, [setAfterSize, hasMoreAfter]);

    const loadMoreBefore = useCallback(() => {
        if (!hasMoreBefore || timeoutRefBefore.current) return;
        timeoutRefBefore.current = setTimeout(() => {
            setBeforeSize(prev => prev + 1);
            timeoutRefBefore.current = null;
        }, 500);
    }, [setBeforeSize, hasMoreBefore]);

    useEffect(() => {
        return () => {
            if (timeoutRefAfter.current) clearTimeout(timeoutRefAfter.current);
            if (timeoutRefBefore.current) clearTimeout(timeoutRefBefore.current);
        };
    }, []);

    const clearMessageId = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("messageId");
        params.delete("forceFetch");
        router.replace(`${pathname}?${params.toString()}`);
    }, [searchParams, router, pathname]);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (messageId) {
            setHighlightedMessageId(Number.parseInt(messageId));
            timeout = setTimeout(() => {
                setHighlightedMessageId(null);
                clearMessageId();
            }, 3000);
        }
        return () => clearTimeout(timeout);
    }, [messageId, clearMessageId]);

    useEffect(() => {
        if (messageIndex === null) return;
        const timeout = setTimeout(() => {
            virtuosoRef.current?.scrollToIndex({
                index: messageIndex,
                align: "center",
                behavior: "smooth"
            });
        }, 100);
        return () => clearTimeout(timeout);
    }, [messageIndex]);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (viewedMessagesIdsToRead.size) {
            timeout = setTimeout(() => {
                batchCreateMessageReads([...viewedMessagesIdsToRead]);
            }, 500);
        }
        return () => {
            clearTimeout(timeout);
        }
    }, [viewedMessagesIdsToRead]);

    const handleMessageView = useCallback((id: number) => {
        if (viewedMessagesIds.has(id)) return;
        setViewedMessagesIds(prev => new Set([...prev, id]));
        setViewedMessagesIdsToRead(prev => new Set([...prev, id]));
        // setViewedMessagesIds(prev => {
        //     if (prev.has(messageId)) return prev;
        //     return new Set([...prev, messageId]);
        // });
    }, [viewedMessagesIds]);

    const handleScroll = (e: React.MouseEvent<HTMLDivElement>) => {
        const bottomScroll = e.currentTarget.scrollHeight - e.currentTarget.scrollTop - e.currentTarget.clientHeight;
        if (lastMessageId && messages.length && lastMessageId !== messages[messages.length - 1].id) return;
        // if (chat?.lastMessage && messages.length && chat.lastMessage.id !== messages[messages.length - 1].id) return;
        if (bottomScroll > 500) {
            setShowScrollToEndButton(true);
        }
        else {
            setShowScrollToEndButton(false);
        }
    }

    const handleJump = () => {
        if (lastMessageId && messages.length && lastMessageId !== messages[messages.length - 1].id) {
            const params = new URLSearchParams(searchParams.toString())
            // params.set("messageId", chat.lastMessage.id.toString());
            params.set("messageId", lastMessageId.toString());
            params.set("forceFetch", Number(1).toString());
            router.replace(`${pathname}?${params.toString()}`);
        }
        else {
            virtuosoRef.current?.scrollToIndex({ index: "LAST" });
        }
    }

    const addViewedMessagesIds = (messagesIds: number[]) => {
        setViewedMessagesIds(prev => new Set([...prev, ...messagesIds]));
    }

    return (
        <>
            {
                isLoading && !groupedMessages?.length ?
                <Loading />
                :
                isError ?
                <h2 className="text-2xl font-semibold text-center my-4">Something went wrong</h2>
                :
                !groupedMessages?.length ?
                <NoMessages />
                :
                <div className="relative">
                    <Virtuoso
                        className="relative"
                        ref={virtuosoRef}
                        onScroll={handleScroll}
                        style={{ height: "80svh" }}
                        data={groupedMessages}
                        alignToBottom
                        firstItemIndex={Number.MAX_SAFE_INTEGER - groupedMessages.length - 1}
                        // initialTopMostItemIndex={messageIndex || groupedMessages.length - 1}
                        initialTopMostItemIndex={messageIndex !== null ? messageIndex : { index: "LAST" }}
                        endReached={loadMoreAfter}
                        startReached={loadMoreBefore}
                        increaseViewportBy={200}
                        itemContent={(_, item) => {
                            if (item.type === "date-header") {
                                return (
                                    <div className="text-center text-sm font-semibold p-1.5 sticky top-0 bg-background-secondary w-fit mx-auto rounded-lg my-1 text-muted">
                                        {item.date}
                                    </div>
                                );
                            }
                            return <Message onView={() => handleMessageView(item.data.id)} member={member} firstUnread={firstUnreadId === item.data.id} highlighted={highlightedMessageId === item.data.id} chat={chat} message={item.data} setEditedMessage={setEditedMessage} setReplyMessage={setReplyMessage} />;
                        }}
                        components={{ 
                            Footer: () => hasMoreAfter ? <Loading /> : null,
                            Header: () => hasMoreBefore ? <Loading /> : null,
                        }}
                    />
                    {
                        (showScrollToEndButton || !endReached) &&
                        <ScrollToEndButton chatId={chat?.id} viewedMessagesIds={viewedMessagesIds} addViewedMessagesIds={addViewedMessagesIds} handleJump={handleJump} />
                    }
                </div>
            }
        </>
    );
}

export default GroupedMessages;