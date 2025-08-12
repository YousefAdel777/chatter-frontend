import CallButton from "@/features/chats/components/CallButton";
import Avatar from "@/features/common/components/Avatar";
import { useCallStore } from "@/store/callStore";
import { FaPhone, FaPhoneSlash } from "react-icons/fa";

type Props = {
    answerCall: (caller: User) => void;
    caller: User;
}

const IncomingCall: React.FC<Props> = ({ answerCall, caller }) => {
    
    const { removeCaller, setIsCallModalOpen, setCallingUser } = useCallStore();

    const acceptCall = () => {
        setCallingUser(caller);
        removeCaller(caller.id);
        setIsCallModalOpen(true);
        answerCall(caller);
    }

    const rejectCall = () => {
        removeCaller(caller.id);
    }

    if (!caller) return;

    return (
        <div className="bg-background shadow-lg p-3 rounded-lg w-40">
            <div className="flex justify-center items-center mb-2 gap-2">
                <Avatar size={50} image={caller.image} alt={caller.username} />
                <h2 className="text-lg font-bold">{caller.username}</h2>
            </div>
            <div className="flex items-center justify-center gap-3">
                <CallButton className="bg-green-500" onClick={acceptCall}>
                    <FaPhone size={20} className="text-white" />
                </CallButton>
                <CallButton className="bg-red-500" onClick={rejectCall}>
                    <FaPhoneSlash size={20} className="text-white" />
                </CallButton>
            </div>
        </div>
    );
}

export default IncomingCall;