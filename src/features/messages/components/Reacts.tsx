import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import MessageReact from "./MessageReact";
import MessageReactsModal from "./MessageReactsModal";
import { FaRegSmile } from "react-icons/fa";

type Props = {
    messageId: number;
    reactId?: number;
    reacts: MessageReact[];
}

const Reacts: React.FC<Props> = ({ messageId, reactId, reacts }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const groupReactsByEmoji = (messageReacts: MessageReact[]) => {
        return messageReacts.reduce((acc: { [emoji: string]: MessageReact[] }, react) => {
            if (acc[react.emoji]) {
                acc[react.emoji].push(react);
            }
            else {
                acc[react.emoji] = [react];
            }
            return acc;
        }, {});
    }

    const groupedReacts = useMemo(() => groupReactsByEmoji(reacts), [reacts]);

    return (
        <div className={`flex items-center gap-1.5 max-w-40 flex-wrap mt-1`}>
            {
                isModalOpen &&
                createPortal(
                    <MessageReactsModal 
                        reacts={reacts} 
                        closeModal={() => setIsModalOpen(false)} 
                    />,
                    document.body
                )
            }
            {
                Object.entries(groupedReacts).map(([emoji, group]) => (
                    <MessageReact 
                        messageId={messageId} 
                        reactId={reactId} 
                        reacts={group} 
                        emoji={emoji} key={emoji} 
                        reactsCount={group.length} 
                    />
                ))
            }
            {
                reacts.length > 0 &&
                <div 
                    onClick={() => setIsModalOpen(true)} 
                    className="cursor-pointer text-xs flex items-center justify-center px-2 py-1.5 rounded-full bg-background-secondary text-primary hover:text-muted hover:bg-primary"
                >
                    <FaRegSmile size={18} />
                </div>
            }
        </div>
    );
}

export default Reacts;