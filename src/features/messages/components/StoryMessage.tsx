import MiniStory from "@/features/stories/components/MiniStory";
import TextMessage from "./TextMessage";

type Props = {
    message: Message;
}

const StoryMessage: React.FC<Props> = ({ message }) => {
    return (
        <div>
            {
                message.story ?
                <MiniStory story={message.story} />
                :
                <p className=" font-semibold italic text-sm">Story Unavailable</p>
            }
            <div className="mt-1.5">
                <TextMessage message={message} />
            </div>
        </div>
    );
}

export default StoryMessage;