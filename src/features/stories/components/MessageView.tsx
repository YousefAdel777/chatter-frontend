import { formatDate, getFormattedHours } from "@/features/common/lib/utils";
import User from "@/features/users/components/User";

type Props = {
    messageView: MessageRead;
}

const MessageView: React.FC<Props> = ({ messageView }) => {
    return (
        <div className="flex items-center justify-between">
            <User user={messageView.user} />
            <p className="text-sm text-muted font-semibold">{formatDate(messageView.createdAt)} {getFormattedHours(messageView.createdAt)}</p>
        </div>
    );
}

export default MessageView;