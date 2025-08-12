type Props = {
    isDisabled?: boolean;
    onClick?: () => void;
    children?: React.ReactNode;
    className?: string;
}

const MenuItem = ({ onClick, children, className, isDisabled }: Props) => {
    return (
        <div
            onClick={e => {
                e.preventDefault();
                if (!isDisabled && onClick) {
                    onClick();
                }
            }}
            className={`px-4 text-nowrap py-3 gap-3 flex text-sm font-semibold items-center duration-200 hover:bg-background-ternary ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className || ""}`}
        >
            {children}
        </div>
    )
}

export default MenuItem;