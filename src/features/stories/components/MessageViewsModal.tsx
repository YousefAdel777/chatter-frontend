import Loading from "@/features/common/components/Loading";
import Modal from "@/features/common/components/Modal";
import useSWR from "swr";
import MessageView from "./MessageView";

type Props = {
    closeModal: () => void;
    messageId: number;
}

const MessageViewsModal: React.FC<Props> = ({ messageId, closeModal }) => {

    const { data: messageReads, isLoading, error } = useSWR<MessageRead[]>(`/api/message-reads?messageId=${messageId}`);

    return (
        <Modal title="Message Views" closeModal={closeModal}>
            {
                isLoading ?
                <Loading />
                :
                error ?
                <h2 className="text-center font-semibold text-muted">Something went worng</h2>
                :
                messageReads?.length === 0 ?
                <h2 className="text-center font-semibold text-muted">No message reads</h2>
                :
                <div className="max-h-72 overflow-y-auto">
                    {
                        messageReads?.map(messageRead => (
                            <MessageView messageView={messageRead} key={messageRead.id} />
                        ))
                    }
                </div>
            }
        </Modal>
    )
}

export default MessageViewsModal;