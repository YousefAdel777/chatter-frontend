import Avatar from "@/features/common/components/Avatar";
import { formatDate, getFormattedHours } from "@/features/common/lib/utils";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import StoriesModal from "./StoriesModal";
import { useSession } from "next-auth/react";

type Props = {
    stories: Story[];
}

const UserStories: React.FC<Props> = ({ stories }) => {

    const user = stories[0].user;
    const { data: session } = useSession();
    const [showStoriesModal, setShowStoriesModal] = useState(false);
    const viewed = useMemo(() => {
        return stories.every(story => story.isViewed || story.user.id.toString() === session?.user?.id);
    }, [stories, session?.user?.id]);

    return (
        <>
            {
                showStoriesModal &&
                createPortal(
                    <StoriesModal startIndex={0} stories={stories} closeModal={() => setShowStoriesModal(false)} />,
                    document.body
                )
            }
            <div onClick={() => setShowStoriesModal(true)} className="flex items-center gap-3 cursor-pointer hover:bg-background-secondary duration-200 py-2 px-3 rounded-md">
                <Avatar
                    size={50}
                    alt={user.username}
                    image={user.image}
                    outline={!viewed}
                />
                <div className="text-sm text-muted">
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-xs">{formatDate(stories[stories.length - 1].createdAt)} - {getFormattedHours(stories[stories.length - 1].createdAt)}</p>
                </div>
            </div>
        </>
    );
}

export default UserStories;