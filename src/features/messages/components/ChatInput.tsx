"use client";

import IconButton from "@/features/common/components/IconButton";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { FiMic, FiSend, FiSmile, FiX } from "react-icons/fi";
import MessageInputMenu from "./MessageInputMenu";
import { createMessageMutationAfter, createMessageMutationBefore, updateMessageMutation } from "../mutations";
import { useSession } from "next-auth/react";
import SelectedMessage from "./SelectedMessage";
import Picker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react';
import Recorder from "./Recorder";
import { useTheme } from "next-themes";
import { useMessagesContext } from "../contexts/MessagesContextProvider";
import { createMessageWithFiles, updateMessage } from "../actions";
import useTypingUsers from "../hooks/useTypingUsers";
import { useRouter } from "next/navigation";
import Editor from "@/features/common/components/Editor";
import useSWR from "swr";
import { Editor as TipTapEditor, JSONContent } from "@tiptap/react";
import getMentionedUsersIds from "@/features/common/lib/getMentionedUsersIds";

type Props = {
    chatId?: number;
    enableMentions?: boolean;
    userId?: number;
    editedMessage: Message | null;
    replyMessage: Message | null;
    unselectMessage: () => void;
}

const ChatInput: React.FC<Props> = ({ chatId, enableMentions, userId, editedMessage, replyMessage, unselectMessage }) => {

    const { data: session } = useSession();
    const [message, setMessage] = useState(editedMessage?.content || "");
    const [messageJson, setMessageJson] = useState(() => editedMessage?.contentJson ? JSON.parse(editedMessage?.contentJson) : null);
    const [isEmojiMenuOpen, setIsEmojiMenuOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isRecorderOpen, setIsRecorderOpen] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const [typing, setTyping] = useState(false);
    const typingTimeout = useRef<NodeJS.Timeout>(null);
    const pickerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const router = useRouter();
    const { mutateAfter, mutateBefore, paginatedDataAfter, paginatedDataBefore, hasMoreAfter } = useMessagesContext() ;
    const { startTyping, stopTyping } = useTypingUsers(chatId);
    const { data: members } = useSWR<Member[]>(chatId ? `/api/members?chatId=${chatId}` : null);
    const mentionsSuggestions = useMemo(() => members?.map(member => {
        if (member.user.id.toString() === session?.user?.id) return { id: "everyone", label: "everyone", image: "/group_image.webp" };
        return { id: member.user.id.toString(), label: member.user.username, image: member.user.image };
    }), [members, session?.user?.id]);
    const editorRef = useRef<TipTapEditor>(null);

    const hadleSubmit = () => {
        if (!message || !messageJson) return;
        startTransition(async () => {
            const mentionedUsersIds = getMentionedUsersIds(messageJson);
            if (editedMessage) {
                if (paginatedDataAfter) {
                    mutateAfter(updateMessageMutation(editedMessage.id, { content: message, contentJson: JSON.stringify(messageJson) }, paginatedDataAfter), {
                        revalidate: false,
                        populateCache: true,
                        rollbackOnError: true,
                    });
                }
                else if (paginatedDataBefore) {
                    mutateBefore(updateMessageMutation(editedMessage.id, { content: message, contentJson: JSON.stringify(messageJson) }, paginatedDataBefore), {
                        revalidate: false,
                        populateCache: true,
                        rollbackOnError: true,
                    });
                }
                await updateMessage(editedMessage.id, { content: message });
            }
            else {
                const newMessage = { 
                    userId,
                    chatId,
                    content: message,
                    contentJson: JSON.stringify(messageJson),
                    messageType: "TEXT", 
                    replyMessageId: replyMessage?.id,
                    isEveryoneMentioned: mentionedUsersIds.has("everyone"),
                    mentionedUsersIds: [...mentionedUsersIds].filter(userId => userId !== "everyone"),
                };
                const formData = new FormData();
                formData.append("message", new Blob([JSON.stringify(newMessage)], { type: "application/json" }));
                const createdMessage = await createMessageWithFiles(formData);
                if (hasMoreAfter) {
                    unselectMessage();
                    setMessage("");
                    setMessageJson(null);
                    return;
                }
                if (paginatedDataAfter) {
                    mutateAfter(createMessageMutationAfter(paginatedDataAfter, createdMessage), {
                        revalidate: false,
                        populateCache: true,
                        rollbackOnError: true,
                    });
                }
                else if (paginatedDataBefore) {
                    mutateBefore(createMessageMutationBefore(paginatedDataBefore, createdMessage), {
                        revalidate: false,
                        populateCache: true,
                        rollbackOnError: true,
                    });
                }
                else {
                    mutateBefore([{ content: [createdMessage], nextCursor: null, previousCursor: null }], { revalidate: false, populateCache: true, rollbackOnError: true });
                    if (!chatId) {
                        router.push(`/chats/${createdMessage.chatId}`);
                    }
                }
            }
            unselectMessage();
            setMessage("");
            setMessageJson(null);
        });
    }

    const handleChange = (value: string, valueJson: JSONContent) => {
        setMessage(value);
        setMessageJson(valueJson);
        if (!typing && value) {
            startTyping();
            setTyping(true);
        }
        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }
        typingTimeout.current = setTimeout(() => {
            stopTyping();
            setTyping(false);
        }, 1000);
    }

    useEffect(() => {
        return () => {
            stopTyping();
            if (typingTimeout.current) clearTimeout(typingTimeout.current);
        };
    }, [stopTyping]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setIsEmojiMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleEmojiClick = (e: EmojiClickData) => {
        editorRef.current?.commands.insertContent(e.emoji);
    }

    return (
        <div ref={messagesContainerRef} className="absolute bottom-0 w-full">
            {
                editedMessage ?
                <SelectedMessage unselectMessage={unselectMessage} message={editedMessage} />
                :
                replyMessage ?
                <SelectedMessage unselectMessage={unselectMessage} message={replyMessage} />
                :
                null
            }
            {
                isRecorderOpen &&
                <Recorder replyMessageId={replyMessage?.id} chatId={chatId} userId={userId} />
            }
            <div ref={pickerRef} className="w-fit z-10 relative">
                <Picker theme={theme === "dark" ? Theme.DARK : Theme.AUTO} emojiStyle={EmojiStyle.NATIVE} open={isEmojiMenuOpen} onEmojiClick={handleEmojiClick} />
            </div>
            <form onSubmit={e => e.preventDefault()} className="flex items-center justify-center gap-2 w-full bg-background px-4 py-2">
                <MessageInputMenu userId={userId} chatId={chatId} replyMessageId={replyMessage?.id} disabled={isPending} />
                <IconButton onClick={() => !isEmojiMenuOpen && setIsEmojiMenuOpen(true)} disabled={isPending}>
                    {
                        isEmojiMenuOpen ?
                        <FiX size={22} className="text-primary" />
                        :
                        <FiSmile size={22} className="text-primary" />
                    }
                </IconButton>
                <IconButton disabled={isPending} onClick={() => setIsRecorderOpen(!isRecorderOpen)}>
                    {
                        isRecorderOpen ?
                        <FiX size={22} className="text-primary" />
                        :
                        <FiMic size={22} className="text-primary" />
                    }
                </IconButton>
                <div className="flex-1 prose max-w-none dark:prose-invert prose-a:text-primary break-words text-wrap border-border-primary border-[1px] rounded-md">
                    <Editor ref={editorRef} enableMentions={enableMentions} mentionSuggestions={mentionsSuggestions} editable valueJson={messageJson} value={message} handleChange={handleChange} />
                </div>
                <IconButton onClick={hadleSubmit} disabled={isPending}>
                    <FiSend size={22} className="text-primary" />
                </IconButton>
            </form>
        </div>
    );
}

export default ChatInput;