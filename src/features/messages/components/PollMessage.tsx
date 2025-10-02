import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import VotesModal from "./VotesModal";
import PollOption from "./PollOption";
import Button from "@/features/common/components/Button";
import { createVotesMutation, deleteVotesMutation } from "../mutations";
import { useMessagesContext } from "../contexts/MessagesContextProvider";
import { createVotes, deleteVote } from "../actions";

type Props = {
    message: Message;
}

const PollMessage: React.FC<Props> = ({ message }) => {

    const { mutateAfter, mutateBefore, paginatedDataAfter, paginatedDataBefore } = useMessagesContext() ;

    const ended = !!message.endsAt && new Date(message.endsAt) < new Date();
    const { data: session } = useSession();
    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
    const [isVotesModalOpen, setIsVotesModalOpen] = useState(false);
    const votesCount = useMemo(() => message.options?.reduce((acc, option) => acc + option.votes.length, 0), [message?.options]);
    const votedOptions = useMemo(() => message.options?.filter((option) => option.votes.find((vote) => vote.user.id.toString() === session?.user?.id)), [message?.options, session?.user?.id]);
    const hasVoted = useMemo(() => votedOptions && votedOptions?.length > 0, [votedOptions]);
    const [showVotes, setShowVotes] = useState(ended || !!hasVoted);

    const handleSelect = (optionId: number) => {
        if (hasVoted || showVotes) return;
        if (selectedOptions.includes(optionId)) {
            setSelectedOptions(prevState => prevState.filter(id => id !== optionId));
        } 
        else {
            if (message.multiple) {
                setSelectedOptions(prevState => [...prevState, optionId]);
            }
            else {
                setSelectedOptions([optionId]);
            }
        }
    }

    const handleVote = async () => {
        if (!session?.user?.id) return;
        const user = { ...session.user, id: Number.parseInt(session.user.id) }
        const options = {
            revalidate: false,
            populateCache: true,
            rollbackOnError: false,
        }
        const userId = Number.parseInt(session.user.id);
        if (hasVoted) {
            if (paginatedDataAfter) {
                mutateAfter(deleteVotesMutation(message.id, userId, paginatedDataAfter), options);
            }
            if (paginatedDataBefore) {
                mutateBefore(deleteVotesMutation(message.id, userId, paginatedDataBefore), options);
            }
            setShowVotes(false);
            await deleteVote(message.id);
        }
        else {
            if (paginatedDataAfter) {
                mutateAfter(createVotesMutation(message.id, user, { optionsIds: selectedOptions }, paginatedDataAfter), options)
            }
            if (paginatedDataBefore) {
                mutateBefore(createVotesMutation(message.id, user, { optionsIds: selectedOptions }, paginatedDataBefore), options)
            }
            setShowVotes(true);
            await createVotes({ optionsIds: selectedOptions });
        }
    }

    return (
        <div className="p-3 border-border-primary border bg-background shadow-lg rounded-md max-w-md">
            <h2 className="text-xl font-semibold">
                {message.title}
            </h2>
            <p className="text-xs font-semibold text-muted mb-2">
                {
                    message.multiple ? 
                    "Select any number of options" 
                    :
                    "Select one option"
                }
            </p>
            {
                isVotesModalOpen &&
                createPortal(
                    <VotesModal closeModal={() => setIsVotesModalOpen(false)} options={message?.options || []} />,
                    document.body
                )
            }
            <div className="space-y-3 mb-2">
                {
                    message.options?.map((option) => (
                        <PollOption
                            hasVoted={!!hasVoted}
                            isExpired={ended}
                            showVotes={showVotes}
                            handleSelect={() => handleSelect(option.id)}
                            selected={hasVoted && votedOptions ? votedOptions.some(votedOption => votedOption.id === option.id) : selectedOptions.includes(option.id)} 
                            key={option.id} title={option.title} 
                            votes={option.votes} 
                            votesCount={votesCount || 0} 
                        />
                    ))
                }
            </div>
            <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-2.5">
                    <button onClick={() => setIsVotesModalOpen(true)} className="text-sm font-semibold text-muted hover:underline">
                        {votesCount}
                        {votesCount === 1 ? " Vote" : " Votes"}
                    </button>
                    {
                        !ended &&
                        <button onClick={() => setShowVotes(!showVotes)} className="text-sm font-semibold text-muted hover:underline">
                            { showVotes ? "Hide Votes" : "Show Votes"}
                        </button>
                    }
                </div>
                {
                    !ended &&
                    <Button disabled={!hasVoted && selectedOptions.length === 0} onClick={handleVote}>
                        {hasVoted ? "Remove Vote" : "Vote"}
                    </Button>
                }
            </div>
        </div>
    );
}

export default PollMessage;