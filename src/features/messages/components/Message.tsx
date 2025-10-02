"use client";

import { useSession } from "next-auth/react";
import MessageMenu from "./MessageMenu";
import { getFormattedHours } from "@/features/common/lib/utils";
import Reacts from "./Reacts";
import { useEffect, useMemo, useState } from "react";
import TextMessage from "./TextMessage";
import MediaMessage from "./MediaMessage";
import InviteMessage from "./InviteMessage";
import { ImForward } from "react-icons/im";
import { FaCheck, FaCheckDouble, FaEdit, FaStar } from "react-icons/fa";
import CallMessage from "./CallMessage";
import Avatar from "@/features/common/components/Avatar";
import AudioMessage from "./AudioMessage";
import FileMessage from "./FileMessage";
import PollMessage from "./PollMessage";
import StoryMessage from "./StoryMessage";
import { BsFillPinAngleFill } from "react-icons/bs";
import clsx from "clsx";
import RepliedMessage from "./RepliedMessage";
import { createPortal } from "react-dom";
import UserModal from "@/features/users/components/UserModal";
import { useInView } from "react-intersection-observer";

type Props = {
    firstUnread?: boolean;
    highlighted?: boolean;
    chat?: Chat;
    message: Message;
    member?: Member;
    onView: () => void;
    setReplyMessage: (message: Message) => void;
    setEditedMessage: (message: Message) => void;
}

const Message: React.FC<Props> = ({ highlighted, firstUnread, message, chat, member, setReplyMessage, setEditedMessage, onView }) => {
    const { data: session } = useSession();
    const isCurrentUser = session?.user?.id === message.user?.id.toString();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { ref, inView } = useInView({ threshold: 0 });
    
    const findUserReactId = (reacts: MessageReact[], userId?: string) => {
        return reacts.find(react => react.user.id.toString() === userId)?.id;
    }
    const reactId = useMemo(() => findUserReactId(message.reacts, session?.user?.id), [message.reacts, session?.user?.id]);

    const handleUserClick = () => {
        if (isCurrentUser || !message.user) return;
        setIsModalOpen(true);
    }

    useEffect(() => {
        if (inView && !message.isSeen && message.user?.id.toString() !== session?.user?.id) {
            onView();
        }
    }, [inView, onView, message.user?.id, message.isSeen, session?.user?.id]);

    return (
            <div   ref={ref} className={clsx("flex flex-wrap items-start gap-3 mx-2 duration-100 p-1.5 rounded-md", {
                "bg-primary/30": highlighted,
                "hover:bg-background-ternary": !highlighted
            })}>
                {
                    isModalOpen && message.user &&
                    createPortal(
                        <UserModal user={message.user} closeModal={() => setIsModalOpen(false)} />,
                        document.body
                    )
                }
                {
                    firstUnread &&
                    <div className="w-full py-1 bg-background-secondary rounded-md">
                        <p className="text-center text-sm font-semibold text-primary">
                            New Unread Messages
                        </p>
                    </div>
                }
                <Avatar onClick={handleUserClick} className="min-w-11 cursor-pointer" size={45} image={message.user?.image || "/user_image.webp"} alt={message.user?.username} />
                <div className="flex-1">
                    {
                        message.replyMessage &&
                        <RepliedMessage message={message.replyMessage} />
                    }
                    <div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold cursor-pointer truncate text-nowrap max-w-44 md:max-w-none" onClick={handleUserClick}>{message.user?.username || "Deleted User"}</p>
                                <p className="text-xs mt-0.5 font-semibold text-muted text-nowrap">{getFormattedHours(message.createdAt)}</p>
                            </div>
                            <MessageMenu chat={chat} member={member} reactId={reactId} setEditedMessage={setEditedMessage} setReplyMessage={setReplyMessage} message={message} />
                        </div>
                    </div>
                    {
                        message.messageType === "TEXT" ?
                        <TextMessage message={message} />
                        :
                        message.messageType === "MEDIA" ?
                        <MediaMessage attachments={message.attachments} />
                        :
                        message.messageType === "INVITE" ?
                        <InviteMessage message={message} />
                        :
                        message.messageType === "AUDIO" && message.fileUrl ?
                        <AudioMessage file={message.fileUrl} />
                        :
                        message.messageType === "FILE" && message.fileUrl ? 
                        <FileMessage 
                            fileSize={message.fileSize || 0} 
                            fileName={message.originalFileName || ""} 
                            filePath={message.fileUrl} 
                        />
                        :
                        message.messageType === "POLL" ?
                        <PollMessage message={message} />
                        :
                        message.messageType === "CALL" ?
                        <CallMessage otherUser={chat?.otherUser || undefined} missed={message.missed || false} duration={message.duration || 0} user={message.user || undefined} />
                        :
                        message.messageType === "STORY" ? 
                        <StoryMessage message={message} />
                        :
                        null
                    }
                    <div className="flex items-center gap-3 mt-1">
                        {
                            message.isForwarded &&
                            <div className="font-bold italic text-muted flex items-center gap-2">
                                <ImForward size={12} />
                                <p className="text-xs">Forwarded</p>
                            </div>
                        }
                        {
                            message.isEdited &&
                            <div className="font-bold italic text-muted flex items-center gap-2">
                                <FaEdit size={12} />
                                <p className="text-xs">Edited</p>
                            </div>
                        }
                        {
                            message.pinned &&
                            <div className="font-bold italic text-muted flex items-center gap-2">
                                <BsFillPinAngleFill size={12} />
                                <p className="text-xs">Pinned</p>
                            </div>
                        }
                        {
                            message.starred &&
                            <div className="font-bold italic text-muted flex items-center gap-2">
                                <FaStar size={12} />
                                <p className="text-xs">Starred</p>
                            </div>
                        }
                        {
                            !isCurrentUser || chat?.chatType === "GROUP" ?
                            null
                            :
                            message.isSeen ?
                            <FaCheckDouble className="text-primary" />
                            :
                            <FaCheck className="text-muted" />
                        }
                    </div>
                    <Reacts reactId={reactId} messageId={message.id} reacts={message.reacts} />
                </div>
            </div>
    );
}

export default Message;