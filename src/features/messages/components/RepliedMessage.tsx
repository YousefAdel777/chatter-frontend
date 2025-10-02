import { formatCallDuration, formatDate, formatFileSize, getFormattedHours } from "@/features/common/lib/utils";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { FaEnvelope, FaFile, FaImage, FaPhone, FaPoll } from "react-icons/fa";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { HiSpeakerWave } from "react-icons/hi2";

type Props = {
    message: MessagePreview;
}

const RepliedMessage: React.FC<Props> = ({ message }) => {

    const { data: session } = useSession();
    const isCurrentUser = session?.user?.id === message.user?.id.toString();

    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const messageUrl = useMemo(() => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("messageId", message.id.toString());
        return `${pathname}?${params.toString()}`;
    }, [message.id, searchParams, pathname]);

    return (
        <div className="rounded-lg max-h-32 p-3 bg-background-secondary flex-1 cursor-pointer" onClick={() => router.push(messageUrl)}>
            <div className="flex items-center gap-3 text-xs font-semibold text-muted mb-1.5">
                <p>
                    {isCurrentUser ? "You" : (message.user?.username || "Deleted user")}
                </p>
                -
                <p>
                    {formatDate(message.createdAt)} {getFormattedHours(message.createdAt)} 
                </p>
            </div>
            {
                message.messageType === "MEDIA" ?
                <div className="flex items-center gap-3 text-muted font-semibold text-sm">
                    <FaImage size={18} />
                    {message.attachmentsCount} Media {message.attachmentsCount === 1 ? "File" : "Files"}
                </div>
                :
                message.messageType === "POLL" ?
                <div className="flex items-center gap-3 text-muted font-semibold text-sm">
                    <FaPoll size={18} />
                    {message.title}
                </div>
                :
                message.messageType === "FILE" ?
                <div className="flex items-center gap-3 text-muted font-semibold text-sm">
                    <FaFile size={18} />
                    <span>
                        {message.originalFileName} - {formatFileSize(message.fileSize || 0)}
                    </span>
                </div>
                :
                message.messageType === "AUDIO" ?
                <div className="flex items-center gap-3 text-muted font-semibold text-sm">
                    <HiSpeakerWave size={18} />
                    <span>
                        Audio Message
                    </span>
                </div>
                :
                message.messageType === "INVITE" ?
                <div className="flex items-center gap-3 text-muted font-semibold text-sm">
                    <FaEnvelope size={18} />
                    <span>
                        Group Invite
                    </span>
                </div>
                :
                message.messageType === "CALL" && message.duration !== null ?
                <div className="flex items-center gap-3 text-muted font-semibold text-sm">
                    <FaPhone size={18} />
                    <span>
                        {message.missed ? "Missed Call" : `Call: ${formatCallDuration(message.duration)}`}
                    </span>
                </div>
                :
                null
            }
            {
                message.content &&
                <div className="prose line-clamp-1 dark:prose-invert prose-a:text-primary">
                    <Markdown rehypePlugins={[remarkGfm]}>
                        {message.content}
                    </Markdown>
                </div>
            }
        </div>
    )
}

export default RepliedMessage;