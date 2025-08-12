"use client";

import { twMerge } from "tailwind-merge";
import { useFormStatus } from "react-dom";

type Props = React.ComponentProps<"button"> & {
    isLoading?: boolean;
};

const Button: React.FC<Props> = ({ children, isLoading, className, ...props }) => {

    const { pending } = useFormStatus();

    return (
        <button disabled={isLoading || pending} {...props} className={twMerge("px-4 mb-2 py-2 block rounded-md font-semibold bg-primary text-white hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50 duration-100", className)}>
            {children}
        </button>
    );
}

export default Button;