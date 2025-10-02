import { formatCallDuration } from "@/features/common/lib/utils";
import { useSession } from "next-auth/react";
import { FaEnvelope, FaFile, FaImage, FaPhone, FaPoll } from "react-icons/fa";
import { HiSpeakerWave } from "react-icons/hi2";

type Props = {
    message: MessagePreview;
}

const ChatLastMessage: React.FC<Props> = ({ message }) => {

    const { data: session } = useSession();

    return (
        <div className="text-xs md:max-w-48 text-muted truncate flex gap-2">
            <span>{message?.user?.id.toString() === session?.user?.id ? "You: " : `${message?.user?.username || "Deleted User"}: `}</span>
            {
                message.content ?
                <div className="truncate md:max-w-32 lg:max-w-none">
                    {message.content}
                </div>
                :
                message.messageType === "MEDIA" ?
                <div className="flex items-center gap-1.5 text-muted font-medium text-xs">
                    <FaImage size={13} />
                    {message.attachmentsCount} Media {message.attachmentsCount === 1 ? "File" : "Files"}
                </div>
                :
                message.messageType === "POLL" ?
                <div className="flex items-center gap-1.5 text-muted font-medium text-xs">
                    <FaPoll size={13} />
                    {message.title}
                </div>
                :
                message.messageType === "FILE" ?
                <div className="flex items-center gap-1.5 text-muted font-medium text-xs">
                    <FaFile size={13} />
                    <span>
                        {message.originalFileName}
                    </span>
                </div>
                :
                message.messageType === "AUDIO" ?
                <div className="flex items-center gap-1.5 text-muted font-medium ">
                    <HiSpeakerWave size={13} />
                    <span>
                        Audio Message
                    </span>
                </div>
                :
                message.messageType === "INVITE" ?
                <div className="flex items-center gap-1.5 text-muted font-medium text-xs">
                    <FaEnvelope size={13} />
                    <span>
                        Group Invite
                    </span>
                </div>
                :
                message.messageType === "CALL" && message.duration !== null ?
                <div className="flex items-center gap-1.5 text-muted font-medium text-xs">
                    <FaPhone size={13} />
                    <span>
                        {message.missed ? "Missed Call" : `Call: ${formatCallDuration(message.duration)}`}
                    </span>
                </div>
                :
                null
            }
        </div>
    );
}

export default ChatLastMessage;