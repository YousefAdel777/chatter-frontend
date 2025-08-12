import clsx from "clsx";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

type Props = {
    size?: number;
    className?: string;
    isOnline?: boolean;
    outline?: string;
    alt?: string;
    image?: string;
    onClick?: () => void;
}

const Avatar: React.FC<Props> = ({ size = 40, alt, image, className, isOnline, outline, onClick }) => {

    if (!image) {
        return;
    }

    return (
        <div 
            onClick={onClick}
            style={{ color: outline || "" }}
            className={clsx("relative rounded-full", {
                "ring-2 ring-offset-2": outline
            })}
        >
            <Image height={size} width={size} src={image} alt={alt || "Avatar image"} className={twMerge("rounded-full", className)} />
            {
                isOnline &&
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            }
        </div>
    );
}

export default Avatar;