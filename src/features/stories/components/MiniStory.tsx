import { useState } from "react";
import { createPortal } from "react-dom";
import StoriesModal from "./StoriesModal";
import Player from "next-video/player";
import Image from "next/image";

type Props = {
    story: Story;
}

const MiniStory: React.FC<Props> = ({ story }) => {
    const [showStoriesModal, setShowStoriesModal] = useState(false);
    
    return (
        <>
            {
                showStoriesModal &&
                createPortal(
                    <StoriesModal closeModal={() => setShowStoriesModal(false)} startIndex={0} stories={[story]} />,
                    document.body
                )
            }
            <div onClick={() => setShowStoriesModal(true)} className="rounded-md cursor-pointer h-28 w-28 overflow-hidden">
                {
                    story.storyType === "TEXT" ?
                    <div style={{ backgroundColor: story.backgroundColor }} className="w-full h-full text-center flex justify-center items-center">
                        <p style={{ color: story.textColor }} className="font-semibold">{story.content}</p>
                    </div>
                    :
                    story.storyType === "IMAGE" ?
                    <Image alt="Story Image" src={story.filePath} unoptimized quality={100} className="object-cover" />
                    :
                    story.storyType === "VIDEO" ?
                    <Player src={story.filePath} muted controls={false} />
                    :
                    null
                }
            </div>
        </>
    );
}

export default MiniStory;