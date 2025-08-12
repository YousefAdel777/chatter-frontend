import Menu from "@/features/common/components/Menu";
import MenuButton from "@/features/common/components/MenuButton";
import MenuItem from "@/features/common/components/MenuItem";
import Picker, { EmojiStyle, Theme } from "emoji-picker-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { FaEdit, FaEye, FaReply, FaSmile, FaStar, FaTrashAlt } from "react-icons/fa";
import { ImForward } from "react-icons/im";
import { createReactMutation, deleteMessageMutation, pinMessageMutation, starMessageMutation, updateReactMutation } from "../mutations";
import ForwardMessageModal from "./ForwardMessageModal";
import { createPortal } from "react-dom";
import MessageViewsModal from "@/features/stories/components/MessageViewsModal";
import { BsFillPinAngleFill, BsPinAngle } from "react-icons/bs";
import { FaRegStar } from "react-icons/fa6";
import { useMessagesContext } from "../contexts/MessagesContextProvider";
import { createReact, deleteMessage, pinMessage, starMessage, unpinMessage, unstarMessage, updateReact } from "../actions";
import { useTheme } from "next-themes";

type Props = {
    chat?: Chat;
    message: Message;
    reactId?: number;
    member?: Member;
    setReplyMessage: (message: Message) => void;
    setEditedMessage: (message: Message) => void;
}

const MessageMenu: React.FC<Props> = ({ chat, member, message, reactId, setReplyMessage, setEditedMessage }) => {

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
    const [isReactPickerOpen, setIsReactPickerOpen] = useState(false);
    const [showMessageViews, setShowMessageViews] = useState(false);
    const { data: session } = useSession();
    const isCurrentUser = session?.user?.id === message.user?.id.toString();
    const isAdmin = member?.memberRole === "ADMIN" || member?.memberRole === "OWNER";
    const pickerRef = useRef<HTMLDivElement | null>(null);
    const menuContainerRef = useRef<HTMLDivElement | null>(null);
    const { mutateAfter, mutateBefore, paginatedDataAfter, paginatedDataBefore } = useMessagesContext() as MessagesContextType;
    const { theme } = useTheme();
    const canReply = !chat?.onlyAdminsCanSend || isAdmin;

    const handleDelete = async () => {
        const options = {
            revalidate: false,
            populateCache: true,
            rollbackOnError: true,
        };
        if (paginatedDataBefore) {
            mutateBefore(deleteMessageMutation(message.id, paginatedDataBefore), options);
        }
        if (paginatedDataAfter) {
            mutateAfter(deleteMessageMutation(message.id, paginatedDataAfter), options);
        }
        setIsMenuOpen(false);
        await deleteMessage(message.id);
    }

    const handleReact = async (emoji: string) => {
        if (!session?.user?.id) return;
        const user = { ...session?.user, id: Number.parseInt(session.user.id) };
        const options = {
            revalidate: false,
            populateCache: true,
            rollbackOnError: true,
        };
        setIsReactPickerOpen(false);
        const data = {
            messageId: message.id,
            emoji,
        }
        if (!reactId) {
            if (paginatedDataBefore) {
                mutateBefore(createReactMutation(data, user, paginatedDataBefore), options);
            }
            if (paginatedDataAfter) {
                mutateAfter(createReactMutation(data, user, paginatedDataAfter), options);
            }
            await createReact({ messageId: message.id, emoji });
        }
        else {
            if (paginatedDataBefore) {
                mutateBefore(updateReactMutation(reactId, message.id, { emoji }, paginatedDataBefore), options);
            }
            if (paginatedDataAfter) {
                mutateAfter(updateReactMutation(reactId, message.id, { emoji }, paginatedDataAfter), options);
            }
            await updateReact(reactId, { emoji });
        }
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setIsReactPickerOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePin = async () => {
        const options = {
            revalidate: false,
            populateCache: true,
            rollbackOnError: true,
        }
        if (message.pinned) {
            if (paginatedDataBefore) {
                mutateBefore(pinMessageMutation(message.id, paginatedDataBefore, false), options);
            }
            if (paginatedDataAfter) {
                mutateAfter(pinMessageMutation(message.id, paginatedDataAfter, false), options);
            }
            await unpinMessage(message.id);

        }
        else {
            if (paginatedDataBefore) {
                mutateBefore(pinMessageMutation(message.id, paginatedDataBefore, true), options);
            }
            if (paginatedDataAfter) {
                mutateAfter(pinMessageMutation(message.id, paginatedDataAfter, true), options);
            }
            await pinMessage(message.id);
        }
    }

    const handleStar = async () => {
        const options = {
            revalidate: false,
            populateCache: true,
            rollbackOnError: true,
        }
        if (message.starred) {
            if (paginatedDataBefore) {
                mutateBefore(starMessageMutation(message.id, paginatedDataBefore, false), options);
            }
            if (paginatedDataAfter) {
                mutateAfter(starMessageMutation(message.id, paginatedDataAfter, false), options);
            }
            await unstarMessage(message.id);
        }
        else {
            if (paginatedDataBefore) {
                mutateBefore(starMessageMutation(message.id, paginatedDataBefore, true), options);
            }
            if (paginatedDataAfter) {
                mutateAfter(starMessageMutation(message.id, paginatedDataAfter, true), options);
            }
            await starMessage(message.id);
        }
    }

    return (
        <div ref={menuContainerRef} className="relative">
            {
                isForwardModalOpen &&
                createPortal(
                    <ForwardMessageModal 
                        closeModal={() => setIsForwardModalOpen(false)} 
                        message={message} 
                    />,
                    document.body
                )
            }
            {
                showMessageViews &&
                createPortal(
                    <MessageViewsModal
                        closeModal={() => setShowMessageViews(false)}
                        messageId={message.id}
                    />,
                    document.body
                )
            }
            <div
                className="absolute bottom-4 right-0"
                ref={pickerRef}
            >
                <Picker
                    open={isReactPickerOpen}
                    reactionsDefaultOpen={true} 
                    onReactionClick={(e) => handleReact(e.emoji)} 
                    onEmojiClick={(e) => handleReact(e.emoji)}
                    emojiStyle={EmojiStyle.NATIVE}
                    theme={theme === "dark" ? Theme.DARK : Theme.AUTO}
                />
            </div>
            <MenuButton
                setIsMenuOpen={setIsMenuOpen}
                isMenuOpen={isMenuOpen} 
            />
            {
                isMenuOpen &&
                <Menu triggerRef={menuContainerRef} defaultExpandDirection="up">
                    <MenuItem onClick={() => {
                        setIsReactPickerOpen(true);
                        setIsMenuOpen(false);
                    }}>
                        <FaSmile size={18} className="text-primary" />
                        React
                    </MenuItem>
                    {
                        canReply &&
                        <MenuItem onClick={() => {
                            setReplyMessage(message);
                            setIsMenuOpen(false);
                        }}>
                            <FaReply size={18} className="text-primary" />
                            Reply
                        </MenuItem>
                    }
                    {
                        message.messageType !== "INVITE" &&
                        <MenuItem onClick={() => {
                            setIsForwardModalOpen(true);
                            setIsMenuOpen(false);
                        }}>
                            <ImForward size={18} className="text-primary" />
                            Forward
                        </MenuItem>
                    }
                    {
                        isCurrentUser && !chat?.onlyAdminsCanSend && message.content &&
                        <MenuItem onClick={() => {
                            setEditedMessage(message);
                            setIsMenuOpen(false);
                        }}>
                            <FaEdit size={18} className="text-primary" />
                            Edit
                        </MenuItem>
                    }
                    {
                        (chat?.chatType === "INDIVIDUAL" || !chat?.onlyAdminsCanPin || isAdmin) &&
                        <MenuItem onClick={handlePin}>
                            {message.pinned ? <BsFillPinAngleFill className="text-primary" size={18} /> : <BsPinAngle className="text-primary" size={18} /> }
                            { message.pinned ? "Pinned" : "Pin" }
                        </MenuItem>
                    }
                    <MenuItem onClick={handleStar} >
                        { message.starred ? <FaStar className="text-primary" size={18} /> : <FaRegStar className="text-primary" size={18} /> }
                        { message.starred ? "Starred" : "Star" }
                    </MenuItem>
                    {
                        (isAdmin || isCurrentUser) && 
                        <MenuItem onClick={handleDelete} className="text-red-500">
                            <FaTrashAlt size={18} /> 
                            Delete
                        </MenuItem>
                    }
                    {
                        isCurrentUser && chat?.chatType === "GROUP" &&
                        <MenuItem onClick={() => setShowMessageViews(true)} className="text-primary">
                            <FaEye size={18} /> 
                            Views
                        </MenuItem>
                    }
                </Menu>
            }
        </div>
    );
}

export default MessageMenu;