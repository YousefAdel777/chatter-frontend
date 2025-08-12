import WavesurferPlayer from "@wavesurfer/react"

import { memo, useEffect, useState } from "react";
import IconButton from "./IconButton";
import WaveSurfer from "wavesurfer.js";
import { FaPause, FaPlay } from "react-icons/fa";
import { formatCallDuration } from "../lib/utils";
import Loading from "./Loading";

type Props = {
    src: string;
}

const AudioPlayer: React.FC<Props> = ({ src }) => {

    const [currentTime, setCurrentTime] = useState(0);
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer>();
    const [isPlaying, setIsPlaying] = useState(false);

    const onReady = (ws: WaveSurfer) => {
        setWavesurfer(ws);
        setIsPlaying(false);
    }

    const onPlayPause = () => {
        if (wavesurfer) {
            wavesurfer.playPause();
        }
    }

    useEffect(() => {
        if (!wavesurfer) return;
        const updateTime = () => setCurrentTime(wavesurfer.getCurrentTime());    
        wavesurfer.on("audioprocess", updateTime);
        wavesurfer.on("seeking", updateTime);
        return () => {
            wavesurfer.un("audioprocess", updateTime);
            wavesurfer.un("seeking", updateTime);
        };
    }, [wavesurfer]);

    return (
        <div className="flex items-center w-full gap-1.5 py-1.5 px-2 overflow-hidden bg-background-ternary rounded-lg">
            <IconButton disabled={!wavesurfer} type="button" onClick={onPlayPause}>
                {   
                    !wavesurfer ?
                    <Loading size={30} />
                    :
                    isPlaying ?
                    <FaPause size={18} className="text-primary" />
                    :
                    <FaPlay size={18} className="text-primary" />
                }
            </IconButton>
            <div className="flex-1">
                <WavesurferPlayer
                    key={src}
                    height={60}
                    waveColor="#60a5fa"
                    progressColor="#3b82f6"
                    url={src}
                    barWidth={4}
                    barGap={1}
                    onReady={onReady}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                />
            </div>
            {
                wavesurfer &&
                <p className="text-xs font-semibold text-muted ml-2">{isPlaying ? formatCallDuration(Math.round(currentTime)) : formatCallDuration(Math.round(wavesurfer?.getDuration()))}</p>
            }
        </div>
    );
}

export default memo(AudioPlayer);