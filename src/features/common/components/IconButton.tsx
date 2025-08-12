import { twMerge } from "tailwind-merge";

type Props = React.ComponentProps<"button">

const IconButton: React.FC<Props> = ({ children, onClick, className, ...props }) => {
    return (
        <button onClick={onClick} {...props} className={twMerge("flex min-w-10 h-10 rounded-full duration-200 hover:bg-background-ternary items-center justify-center disabled:cursor-not-allowed disabled:opacity-50", className)}>
            {children}
        </button>
    );
}

export default IconButton;