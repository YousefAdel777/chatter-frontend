import Avatar from "@/features/common/components/Avatar";

type Props = {
    user: User;
    onClick: () => void;
}

const SearchResult: React.FC<Props> = ({ user, onClick }) => {
    return (
        <div className="flex py-2 px-3 hover:background-secondary cursor-pointer duration-200 items-center gap-2" onClick={onClick}>
            <Avatar alt={user.username} image={user.image} size={50} />
            <div className="space-y-1">
                <p className="text-sm font-semibold">
                    {user.username}
                </p>
                <p className="text-xs text-muted">
                    {user.email}
                </p>
                <p className="text-xs text-muted">
                    {user.bio}
                </p>
            </div>
        </div>
    );
}

export default SearchResult;