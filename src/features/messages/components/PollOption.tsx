import clsx from "clsx";
import { useMemo } from "react";

type Props = {
    title: string;
    votes: Vote[];
    selected: boolean;
    votesCount: number;
    showVotes: boolean;
    handleSelect: () => void;
    hasVoted: boolean;
    isExpired: boolean; 
}

const PollOption: React.FC<Props> = ({ hasVoted, title, showVotes, selected, votes, votesCount, handleSelect }) => {

    const votesPercentage = useMemo(() => Math.round((votes.length / votesCount) * 100) || 0, [votes, votesCount]);

    return (
        <div onClick={handleSelect} className={clsx("flex rounded-md relative items-center px-3 py-3 duration-200 border-2 ", {
            "border-border-primary bg-background-secondary": !selected,
            "border-primary bg-primary/10": selected,
            "cursor-pointer": !hasVoted,
        })}>
            {
                showVotes &&
                <div style={{ width: `${votesPercentage}%` }} className={`absolute top-0 left-0 w-full h-full bg-primary/20`} />
            }
            <div className="flex-1 flex items-center justify-between">
                <h2 className="font-semibold">{title}</h2>
            </div>
            {
                showVotes &&
                <div className="flex items-center gap-2 font-bold text-xs text-muted">
                    <span>{votes.length} {votes.length === 1 ? "Vote" : "Votes"}</span>
                    <span>{votesPercentage}%</span>
                </div>
            }
        </div>
    );
}

export default PollOption;