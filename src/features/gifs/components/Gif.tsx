import clsx from "clsx";
import { useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";

/* eslint-disable @next/next/no-img-element */
type Props = {
    url: string;
    width: number;
    height: number;
    alt: string;
    isFavorite: boolean;
    onClick?: () => void;
    handleFavorite: () => void;
}

const Gif: React.FC<Props> = ({ url, alt, width, height, isFavorite, onClick, handleFavorite }) => {

    const [isLoaded, setIsLoaded] = useState(false);
    const aspectRatio = width / height;

    return (
        <div className="relative group w-full p-0.5" onClick={onClick}>
            {
                !isLoaded &&
                <div
                    style={{ 
                        aspectRatio,
                        width: "100%"
                    }}
                    className="animate-pulse bg-background-secondary rounded-md"
                />
            }
            <img 
                onLoad={() => setIsLoaded(true)}
                className={clsx(
                    "block object-cover p-0.5 rounded-md transition-opacity duration-300",
                    isLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
                )}                
                alt={alt}
                width={width}
                height={height}
                src={url}
            />
            <button className="absolute items-center justify-center right-4 top-4 hidden text-primary bg-black/50 rounded-md group-hover:flex w-8 h-8" onClick={(e) => {
                e.stopPropagation();
                handleFavorite();
            }}>
                {
                    isFavorite ?
                    <FaStar size={18} />
                    :
                    <FaRegStar size={18} />
                }
            </button>
        </div>
    );
}

export default Gif;