import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { createStoryView, deleteStory, updateStory } from "../actions";
import { useSession } from "next-auth/react";
import IconButton from "@/features/common/components/IconButton";
import { FiSend, FiX } from "react-icons/fi";
import { FaChevronLeft, FaChevronRight, FaTrashAlt } from "react-icons/fa";
import MediaStory from "./MediaStory";
import TextStory from "./TextStory";
import ExcludedUsersModal from "./ExcludedUsersModal";
import { createPortal } from "react-dom";
import { createMessageWithFiles } from "@/features/messages/actions";
import StoryViewsModal from "./StoryViewsModal";
import StoriesProgressBar from "./StoriesProgressBar";
import ErrorMessage from "@/features/common/components/ErrorMessage";

type Props = {
    startIndex: number;
    stories: Story[]; 
    closeModal: () => void;
}

const StoriesModal: React.FC<Props> = ({ stories, startIndex, closeModal }) => {

    const { data: session } = useSession();
    const [errorMessage, setErrorMessage] = useState("");
    const [storyIndex, setStoryIndex] = useState(startIndex);
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState("");
    const [showExcludedUsersModal, setShowExcludedUsersModal] = useState(false);
    const [showViewsModal, setShowViewsModal] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [excludedUsersIds, setExcludedUsersIds] = useState(stories[storyIndex].excludedUsersIds);
    const inputRef = useRef<HTMLInputElement>(null);
    const isCurrentUser = session?.user?.id === stories[storyIndex].user.id.toString();
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleIncrement = useCallback(() => {
        if (storyIndex === stories.length - 1) {
            closeModal();
            return;
        }
        const nextStory = stories[storyIndex + 1];
        setExcludedUsersIds(nextStory.excludedUsersIds)
        if (!isCurrentUser && !nextStory.isViewed) {
            createStoryView(nextStory.id);
        }
        setStoryIndex(prev => (prev + 1));
    }, [closeModal, storyIndex, isCurrentUser, stories]);

    const handleDecrement = () => {
        if (isPaused) setIsPaused(false);
        setStoryIndex(prev => (prev - 1));
    }

    const handleDelete = () => {
        startTransition(async () => {
            const res = await deleteStory(stories[storyIndex].id);
            if (res?.error) return;
            if (storyIndex === stories.length - 1) {
                closeModal();
            }
        });
    }

    const toggleExclusion = (userId: number) => {
        if (excludedUsersIds.includes(userId)) {
            setExcludedUsersIds(prevState => prevState.filter(id => id !== userId));
        }
        else {
            setExcludedUsersIds(prevState => [...prevState, userId]);
        }
    }

    const handleUpdate = async () => {
        return await updateStory(stories[storyIndex].id, { excludedUsersIds }); 
    }

    const sendStoryMessage = () => {
        setErrorMessage("")
        startTransition(async () => {
            const formData = new FormData();
            formData.append("message", new Blob([JSON.stringify({
                userId: stories[storyIndex].user.id,
                content: message,
                messageType: "STORY",
                storyId: stories[storyIndex].id,
            })], { type: "application/json" }));
            const res = await createMessageWithFiles(formData);
            if (res.error) {
                setErrorMessage(res.error);
            }
            else {
                inputRef.current?.blur();
                setMessage("");
            }
        });
    }

    useEffect(() => {
        if (!isCurrentUser && !stories[startIndex].isViewed) {
            createStoryView(stories[startIndex].id);
        }
    }, [isCurrentUser, stories, startIndex]);

    return (
        <div className="absolute left-0 top-0 w-full h-full bg-black/20">
            {
                showExcludedUsersModal && 
                createPortal(
                    <ExcludedUsersModal  
                        closeModal={() => {
                            setShowExcludedUsersModal(false);
                            setIsPaused(false);
                        }}
                        excludedUsersIds={excludedUsersIds}
                        toggleExclusion={toggleExclusion}
                        handleUpdate={handleUpdate}
                    />,
                    document.body
                )
            }
            {
                showViewsModal &&
                createPortal(
                    <StoryViewsModal  
                        closeModal={() => {
                            setShowViewsModal(false);
                            setIsPaused(false);
                        }}
                        storyId={stories[storyIndex].id}
                    />,
                    document.body
                )
            }
            <div className="h-full">
                {
                    stories[storyIndex].storyType === "TEXT" ?
                    <TextStory
                        setIsPaused={setIsPaused}
                        content={stories[storyIndex].content}
                        textColor={stories[storyIndex].textColor as string}
                        backgroundColor={stories[storyIndex].backgroundColor as string}
                    />
                    :
                    <MediaStory ref={videoRef} setIsPaused={setIsPaused} storyType={stories[storyIndex].storyType} filePath={stories[storyIndex].filePath} />
                }
            </div>
            {
                storyIndex < stories.length - 1 &&
                <div className="flex pr-8 text-white items-center justify-center w-20 h-full absolute right-0 top-0" onClick={handleIncrement}>
                    <button className="w-9 h-9 flex items-center justify-center cursor-pointer rounded-full bg-black/30">
                        <FaChevronRight size={24} />
                    </button>
                </div>
            }
            {
                storyIndex > 0 &&
                <div className="flex pl-8 text-white items-center justify-center h-full absolute left-0 top-0" onClick={handleDecrement}>
                    <button className="w-9 h-9 flex items-center justify-center cursor-pointer rounded-full bg-black/30">
                        <FaChevronLeft size={24} />
                    </button>
                </div>
            }
            <div className="bg-black/30 px-6 py-2.5 absolute left-0 top-0 w-full">
            <div className="flex items-center justify-end gap-4">
                    {
                        isCurrentUser && 
                        <IconButton disabled={isPending} onClick={handleDelete} className="hover:bg-black/20">
                            <FaTrashAlt size={22} className="text-red-500" />
                        </IconButton>
                    }
                    <IconButton onClick={closeModal} className="hover:bg-primary">
                        <FiX size={22} className="text-white" />
                    </IconButton>
                </div>
                <StoriesProgressBar paused={isPaused} index={storyIndex} count={stories.length} handleIncrement={handleIncrement} time={videoRef.current ? (videoRef.current.duration - 1) * 1000 : 5000} />
            </div>
            <div className="absolute bottom-0 left-0 w-full bg-black/30 px-10 py-5">
                {
                    stories[storyIndex].storyType !== "TEXT" &&
                    <p className="text-sm font-semibold text-white text-center max-w-md mx-auto">
                        {stories[storyIndex].content}
                    </p>
                }
                <div className="flex items-center justify-between mt-3">
                    {
                        isCurrentUser ?
                        <>
                            <button 
                                onClick={() => {
                                    setShowExcludedUsersModal(true);
                                    setIsPaused(true);
                                }}
                                className="text-white text-sm font-semibold hover:underline text-nowrap"
                            >
                                Exclude Users
                            </button>
                            <button 
                                onClick={() => {
                                    setShowViewsModal(true);
                                    setIsPaused(true);
                                }}
                                className="text-white text-sm font-semibold hover:underline"
                            >
                                Story Views
                            </button>
                        </>
                        :
                        <>
                            <ErrorMessage message={errorMessage} isActive={!!errorMessage} />
                            <input
                                ref={inputRef}
                                onFocus={() => setIsPaused(true)}
                                onBlur={() => setIsPaused(false)}
                                className="form-input m-0 max-w-lg"
                                value={message}
                                placeholder="Send a message..."
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <IconButton disabled={isPending} className="bg-background" onClick={sendStoryMessage}>
                                <FiSend className="text-primary" size={22} />
                            </IconButton>
                        </>
                    }
                </div>
            </div>
        </div>
    );
}

export default StoriesModal;