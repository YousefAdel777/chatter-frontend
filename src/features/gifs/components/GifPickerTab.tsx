import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type Props = React.ComponentProps<"button"> & {
    isActive?: boolean;
};

const GifPickerTab: React.FC<Props> = ({ isActive, className, ...props }) => {
    return (
        <button
            className={twMerge(clsx("text-base select-none px-2 py-1.5 font-semibold hover:bg-primary hover:text-white duration-200 rounded-xl", {
                "text-white bg-primary": isActive
            }), className)}
            {...props}
        />
    );
}

export default GifPickerTab;