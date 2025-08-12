import Player from "next-video/player";
import clsx from "clsx";
import Loading from "@/features/common/components/Loading";
import Image from "next/image";
import { Ref, useEffect, useState } from "react";

type Props = {
    storyType: StoryType;
    filePath: string;
    ref: Ref<HTMLVideoElement>;
    setIsPaused: (paused: boolean) => void;
}

const MediaStory: React.FC<Props> = ({ storyType, filePath, ref, setIsPaused }) => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setIsPaused(true);
        setIsReady(false);
    }, [filePath, setIsPaused]);

    const handleOnMouseDown = () => {
        setIsPaused(true);
        if (ref && "current" in ref) {
            ref.current?.pause();
        }
    }

    const handleOnMouseUp = () => {
        if (isReady) {
            setIsPaused(false);
            if (ref && "current" in ref) {
                ref.current?.play();
            }
        }
    }

    const handleImageLoaded = () => {
        setIsPaused(false);
        setIsReady(true);
    }

    const handleVideoLoaded = () => {
        setIsPaused(false);
        setIsReady(true);
        if (ref && "current" in ref && ref.current) {
            ref.current?.play();
        }
    }

    return (
        <div 
            style={{ backgroundImage: storyType === "IMAGE" ? `url(${filePath})` : "" }} 
            className="flex relative h-full items-center justify-center bg-cover bg-no-repeat bg-center"
            onMouseDown={handleOnMouseDown}
            onMouseUp={handleOnMouseUp}
            onTouchStart={handleOnMouseDown}
            onTouchEnd={handleOnMouseUp}
        >
            <div className="absolute left-0 top-0 w-full h-full backdrop-blur-lg" />
            {
                <>
                    {
                        !isReady && 
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <Loading />
                        </div>
                    }
                    {
                        
                        storyType === "IMAGE" ?
                        <Image 
                            fill 
                            priority 
                            onLoad={handleImageLoaded} 
                            quality={100} 
                            className={clsx(" object-contain relative duration-150", { 
                                "opacity-0": !isReady, 
                                "opacity-100": isReady 
                            })}
                            src={filePath} 
                            alt="Story image" 
                        />
                        :
                        storyType === "VIDEO" ?
                        <Player 
                            ref={ref} 
                            playsInline 
                            disablePictureInPicture 
                            disableRemotePlayback 
                            unselectable="on" 
                            onCanPlayThrough={handleVideoLoaded}
                            className={clsx("max-h-svh object-contain relative duration-150", {
                                "opacity-0": !isReady, 
                                "opacity-100": isReady
                            })} 
                            controls={false} 
                            muted={false} 
                            autoPlay 
                            src={filePath} 
                        />
                        :
                        null
                    }
                </>
            }
        </div>
    );
}

export default MediaStory;

