import IconButton from "@/features/common/components/IconButton";
import { FiX } from "react-icons/fi";
import RepliedMessage from "./RepliedMessage";

type Props = {
    message: Message;
    unselectMessage: () => void;
}

const SelectedMessage: React.FC<Props> = ({ message, unselectMessage }) => {

    return (
        <div className="flex px-4 py-5 items-center gap-6 bg-background" >
            <RepliedMessage message={message} />
            <IconButton onClick={unselectMessage}>
                <FiX size={22} className="text-primary" />
            </IconButton>
        </div>
    );
}

export default SelectedMessage;