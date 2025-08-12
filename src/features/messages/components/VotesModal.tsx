import Modal from "@/features/common/components/Modal";
import User from "@/features/users/components/User";
import clsx from "clsx";
import { useMemo, useState } from "react";

type Props = {
    options: Option[];
    closeModal: () => void;
}

const VotesModal: React.FC<Props> = ({ closeModal, options }) => {

    const [optionId, setOptionId] = useState(options[0].id);
    const votes = useMemo(() => options.find(option => option.id === optionId)?.votes, [optionId, options]);

    return (
        <Modal  title="Votes" closeModal={closeModal}>
            <div className="flex items-center gap-1.5">
                <div className="overflow-y-auto h-60 divide-y divide-border-primary w-44">
                    {
                        options.map(option => (
                            <div 
                                className={clsx("flex items-center justify-between w-full gap-1 px-2 py-2.5 cursor-pointer duration-200 hover:bg-background-secondary", {
                                    "bg-background-secondary": optionId === option.id,
                                })}
                                onClick={() => setOptionId(option.id)} 
                                key={option.id}
                            >
                                <h3 className="font-semibold truncate">
                                    {option.title}
                                </h3>
                                <span className="rounded-full text-xs text-white flex items-center justify-center font-semibold min-w-5 min-h-5 bg-primary">
                                    {option.votes.length}
                                </span>
                            </div>
                        ))
                    }
                </div>
                <div className="divide-y h-60 divide-border-primary overflow-y-auto flex-1">
                    {
                        votes?.length === 0 &&
                        <p className="tex-xs text-center font-semibold italic text-muted mt-3">
                            No Votes
                        </p>
                    }
                    {
                        votes?.map(vote => (
                            <User user={vote.user} key={vote.id} />
                        ))
                    }
                </div>
            </div>
        </Modal>
    );
}

export default VotesModal;