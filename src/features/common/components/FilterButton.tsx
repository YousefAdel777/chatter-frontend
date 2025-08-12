import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type Props = React.ComponentProps<"button"> & {
    active?: boolean;
};

const FilterButton: React.FC<Props> = ({ children, className, active, ...props}) => {
    return (
        <button 
            {...props} 
            className={twMerge(clsx("flex min-w-10 duration-200 cursor-pointer bg-background-ternary items-center gap-2 rounded-lg px-2 py-1.5", {
                "bg-blue-200": active,
            }), className)}
        >
            {children}
        </button>
    );
}

export default FilterButton;