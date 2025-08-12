import { formatCallDuration } from "@/features/common/lib/utils";
import { useCallStore } from "@/store/callStore";
import { useSession } from "next-auth/react";
import { FaPhone } from "react-icons/fa";

type Props = {
    missed: boolean;
    duration: number;
    user?: User;
    otherUser?: User;
}

const CallMessage: React.FC<Props> = ({ duration, missed, user, otherUser }) => {
    const { data: session } = useSession();
    const isCurrentUser = session?.user?.id === user?.id.toString();

    const { setCallingUser, setIsCallModalOpen } = useCallStore();

    const handleVoiceCall = () => {
        if (!otherUser) return;
        setCallingUser(otherUser);
        setIsCallModalOpen(true);
    };

    if (!otherUser && !isCurrentUser) {
        return;
    }

    return (
        <div className="bg-background-ternary max-w-96 px-3 py-2 rounded-xl font-semibold gap-3">
            <div className="flex items-center justify-between mb-2">
                <FaPhone className="text-primary" size={20} />
                {
                    !missed &&
                    <span className="text-xs italic font-semibold"> 
                        {formatCallDuration(duration)}
                    </span>
                }
            </div>
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-nowrap truncate">
                    {
                        missed ?
                        "Missed call"
                        :
                        isCurrentUser ? 
                        `You called ${otherUser?.username}` 
                        :
                        `You received a call ${user?.username ? `from ${user.username}` : ""}`
                    }
                </p>
                {
                    otherUser && 
                    <button onClick={handleVoiceCall} className="flex cursor-pointer text-nowrap w-fit bg-background-secondary items-center gap-2 rounded-lg px-2 py-1.5">
                        <FaPhone size={18} className="text-primary" />
                        <span className="text-sm font-semibold">
                            Call back
                        </span>
                    </button>
                }
            </div>
        </div>
    );
}

export default CallMessage;