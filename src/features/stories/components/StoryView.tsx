import Avatar from "@/features/common/components/Avatar";
import { formatDate, getFormattedHours } from "@/features/common/lib/utils";

type Props = {
    storyView: StoryView;
}

const StoryView: React.FC<Props> = ({ storyView }) => {
    return (
        <div className="flex items-center gap-3 hover:bg-background-secondary duration-200 rounded-md px-2">
            <div className="flex flex-1 w-full items-center px-2 py-1.5 rounded-md gap-3 ">
                <Avatar size={45} alt={storyView.user.username} image={storyView.user.image}  />
                <h2 className="text-lg max-w-48 font-semibold truncate">{storyView.user.username}</h2>
            </div>
            <p className="text-sm font-semibold text-muted">
                {formatDate(storyView.createdAt)} - {getFormattedHours(storyView.createdAt)}
            </p>
        </div>
    );
}

export default StoryView;