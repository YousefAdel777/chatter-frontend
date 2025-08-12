"use client";

import clsx from "clsx";

type Props = React.ComponentProps<"button"> & {
    isActive?: boolean;
}

const Tab: React.FC<Props> = ({ children, isActive, ...props }) => {

    return (
        <button
            {...props}
            className={clsx(
                "cursor-pointer w-10 h-10 flex items-center justify-center rounded-full hover:bg-background-ternary duration-200",
                {
                    "bg-primary/30 text-primary": isActive,
                    "text-muted": !isActive,
                }
            )}
        >
            {children}
        </button>
    );
}

export default Tab;