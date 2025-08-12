import Avatar from "@/features/common/components/Avatar";
import Switch from "@/features/common/components/Switch";

type Props = {
    username: string;
    image: string;
    excluded: boolean;
    handleToggle: () => void;
}

const ExcludedUser: React.FC<Props> = ({ username, image, excluded, handleToggle }) => {
    return (
        <div className="flex flex-1 w-full justify-between items-center px-2 py-1.5 rounded-md gap-3 cursor-pointer duration-200 hover:bg-background-secondary">
            <div className="flex items-center gap-3">
                <Avatar size={45} alt={username} image={image}  />
                <h2 className="text-lg max-w-48 font-semibold truncate">{username}</h2>
            </div>
            <Switch checked={excluded} onChange={handleToggle} />
        </div>
    )
}

export default ExcludedUser;