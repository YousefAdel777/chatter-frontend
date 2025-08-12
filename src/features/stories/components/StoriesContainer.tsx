import { useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import MenuButton from "@/features/common/components/MenuButton";
import Menu from "@/features/common/components/Menu";
import MenuItem from "@/features/common/components/MenuItem";
import { createPortal } from "react-dom";
import TextStoryModal from "./TextStoryModal";
import MediaStoryModal from "./MediaStoryModal";
import { FaImage } from "react-icons/fa";
import { IoText } from "react-icons/io5";
import UserStories from "./UserStories";
import clsx from "clsx";

type Props = {
    stories: Story[];
    userStories: Story[];
}

const StoriesContainer: React.FC<Props> = ({ stories, userStories }) => {

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isTextStoryModalOpen, setIsTextStoryModalOpen] = useState(false);
    const [isMediaStoryModalOpen, setIsMediaStoryModalOpen] = useState(false);

    const groupStoriesByUser = (stories: Story[]) => {
        return stories.reduce((acc: { [userId: number]: Story[] }, story) => {
            if (!acc[story.user.id]) {
                acc[story.user.id] = []
            }
            acc[story.user.id].push(story);
            return acc;
        }, {});
    }

    const groupedStories = useMemo(() => groupStoriesByUser(stories), [stories]);

    return (
        <div>
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold mb-2 pl-2">
                    Stories
                </h2>
                <div className="relative">
                    <MenuButton isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen}>
                        <FiPlus className={clsx("text-primary hover:bg-background-secondary rounded-full duration-200", { "rotate-45" : isMenuOpen })} size={25} />
                    </MenuButton>
                    {
                        isMenuOpen && 
                        <Menu>
                            <MenuItem onClick={() => setIsTextStoryModalOpen(true)}>
                                <IoText size={18} className="text-primary" />
                                Text
                            </MenuItem>
                            <MenuItem onClick={() => setIsMediaStoryModalOpen(true)}>
                                <FaImage size={18} className="text-primary" />
                                Media
                            </MenuItem>
                        </Menu>
                    }
                </div>
            </div>
            {
                isTextStoryModalOpen &&
                createPortal(
                    <TextStoryModal closeModal={() => setIsTextStoryModalOpen(false)} />,
                    document.body
                )
            }
            {
                isMediaStoryModalOpen &&
                createPortal(
                    <MediaStoryModal closeModal={() => setIsMediaStoryModalOpen(false)} />,
                    document.body
                )
            }
            {
                userStories.length > 0 &&
                <>
                    <h2 className="text-xl font-bold mb-2 pl-2">
                        My Stories
                    </h2>
                    <UserStories stories={userStories} />
                </>
            }
            {
                stories.length === 0 && userStories.length === 0 ?
                <p className="text-sm text-center font-semibold text-muted">
                    No Stories
                </p>
                :
                Object.entries(groupedStories).map(([userId, stories]) => (
                    <UserStories key={userId} stories={stories} />
                ))
            }
        </div>
    );
}

export default StoriesContainer;

