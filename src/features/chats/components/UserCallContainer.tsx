import Avatar from "@/features/common/components/Avatar";
import { FaMicrophoneSlash } from "react-icons/fa";

type Props = {
    muted?: boolean;
    user: User;
}

const UserCallContainer: React.FC<Props> = ({ user, muted }) => {
    return (
        <div className="flex relative p-5 text-center flex-col items-center justify-center gap-3 border-border-primary border-2 rounded-lg w-60 h-44">
            <Avatar alt="user" image={user.image} size={70} />
            <h2 className="text-lg font-semibold">{user.username}</h2>
            {
                muted && 
                <span className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                    <FaMicrophoneSlash size={18} className="text-white" />
                </span>
            }
        </div>
    );
}

export default UserCallContainer;