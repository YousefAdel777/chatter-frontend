import { useState } from "react";
import { createPortal } from "react-dom";
import { FiPlus } from "react-icons/fi";
import AddAttachmentModal from "./AddAttachmentModal";
import Menu from "@/features/common/components/Menu";
import MenuItem from "@/features/common/components/MenuItem";
import { FaFile, FaFileAudio, FaImage, FaPoll } from "react-icons/fa";
import MenuButton from "@/features/common/components/MenuButton";
import AddFilesModal from "./AddFilesModal";
import AudioModal from "./AudioModal";
import PollModal from "./PollModal";

type Props = {
    disabled: boolean;
    userId?: number;
    chatId?: number;
    replyMessageId?: number;
}

const MessageInputMenu: React.FC<Props> = ({ disabled, replyMessageId, userId, chatId }) => {

    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
    const [isPollModalOpen, setIsPollModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="relative">
            {
                isMediaModalOpen && createPortal(
                    <AddAttachmentModal userId={userId} chatId={chatId} replyMessageId={replyMessageId} closeModal={() => setIsMediaModalOpen(false)} />,
                    document.body
                )
            }
            {
                isFileModalOpen && createPortal(
                    <AddFilesModal userId={userId} chatId={chatId} closeModal={() => setIsFileModalOpen(false)} />,
                    document.body
                )
            }
            {
                isAudioModalOpen && createPortal(
                    <AudioModal userId={userId} chatId={chatId} closeModal={() => setIsAudioModalOpen(false)} />,
                    document.body
                )
            }
            {
                isPollModalOpen && createPortal(
                    <PollModal userId={userId} chatId={chatId} replyMessageId={replyMessageId} closeModal={() => setIsPollModalOpen(false)} />,
                    document.body
                )
            }
            <MenuButton disabled={disabled} setIsMenuOpen={setIsMenuOpen} isMenuOpen={isMenuOpen}>
                <FiPlus size={28} className={`text-primary duration-200 ${isMenuOpen ? "rotate-45" : ""}`} />
            </MenuButton>
            {
                isMenuOpen &&
                <Menu className="-translate-y-4 bottom-8">
                    <MenuItem onClick={() => {
                        setIsMediaModalOpen(true);
                        setIsMenuOpen(false);
                    }}>
                        <FaImage size={18} className="text-primary" />
                        Media
                    </MenuItem>
                    <MenuItem onClick={() => {
                        setIsAudioModalOpen(true);
                        setIsMenuOpen(false);
                    }}>
                        <FaFileAudio size={18} className="text-primary" />
                        Audio
                    </MenuItem>
                    <MenuItem onClick={() => {
                        setIsFileModalOpen(true);
                        setIsMenuOpen(false);
                    }}>
                        <FaFile size={18} className="text-primary" />
                        File
                    </MenuItem>
                    <MenuItem onClick={() => {
                        setIsPollModalOpen(true);
                        setIsMenuOpen(false);
                    }}>
                        <FaPoll size={18} className="text-primary" />
                        Poll
                    </MenuItem>
                </Menu>
            }
        </div>
    );
}

export default MessageInputMenu;