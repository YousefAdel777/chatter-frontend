import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { createReactMutation, deleteReactMutation, updateReactMutation } from "../mutations";
import clsx from "clsx";
import { useMessagesContext } from "../contexts/MessagesContextProvider";
import { createReact, deleteReact, updateReact } from "../actions";

type Props = {
    messageId: number;
    emoji: string;
    reacts: MessageReact[];
    reactsCount: number;
    reactId?: number;
}

const MessageReact: React.FC<Props> = ({ reacts, messageId, emoji, reactsCount, reactId }) => {
    const { data: session } = useSession();
    const { mutateAfter, mutateBefore, paginatedDataAfter, paginatedDataBefore } = useMessagesContext() as MessagesContextType;
    const hasReact = useMemo(() => reacts.some((react) => react.user.id.toString() === session?.user?.id), [reacts, session?.user?.id]);

    const handleReact = async () => {
        if (!session?.user?.id) return;
        const user = { ...session.user, id: Number.parseInt(session.user.id) };
        const options = {
            revalidate: false,
            populateCache: true,
            rollbackOnError: true,
        }
        if (hasReact && reactId) {
            if (paginatedDataAfter) {
                mutateAfter(deleteReactMutation(reactId, paginatedDataAfter), options);
            }
            if (paginatedDataBefore) {
                mutateBefore(deleteReactMutation(reactId, paginatedDataBefore), options);
            }
            await deleteReact(reactId);
        }
        else if (reactId) {
            if (paginatedDataAfter) {
                mutateAfter(updateReactMutation(reactId, messageId, { emoji }, paginatedDataAfter), options);
            }
            if (paginatedDataBefore) {
                mutateBefore(updateReactMutation(reactId, messageId, { emoji }, paginatedDataBefore), options);
            }
            await updateReact(reactId, { emoji });
        }
        else {
            if (paginatedDataBefore) {
                mutateBefore(createReactMutation({ emoji, messageId }, user, paginatedDataBefore), options);
            }
            if (paginatedDataAfter) {
                mutateAfter(createReactMutation({ emoji, messageId }, user, paginatedDataAfter), options);
            }
            await createReact({ messageId, emoji });
        }
    }

    return (
        <div 
            onClick={handleReact} 
            className={clsx("cursor-pointer flex items-center justify-center px-2 py-1 rounded-full bg-background-secondary hover:bg-primary ", {
                "bg-primary": hasReact
            })}
        >
            <span className="text-xs font-bold text-muted">
                {reactsCount}
            </span>
            <span>
                {emoji}
            </span>
        </div>
    );
}

export default MessageReact;