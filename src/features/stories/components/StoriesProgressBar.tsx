import { useEffect, useMemo, useState } from "react";

type Props = {
    count: number;
    time: number;
    index: number;
    paused: boolean;
    handleIncrement: () => void;
}

const INTERVAL = 100;

const StoriesProgressBar: React.FC<Props> = ({ count, time, index, paused, handleIncrement }) => {

    const [timePassed, setTimePassed] = useState(0);
    const countArray = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (timePassed + INTERVAL >= time) {
                handleIncrement();
            }
            else if (!paused) {
                setTimePassed(prev => prev + 100);
            }
        }, INTERVAL);
        return () => {
            clearInterval(interval);
        }
    }, [handleIncrement, time, timePassed, paused]);

    useEffect(() => {
        setTimePassed(0);
    }, [index]);

    if (count === 0) return null;

    return (
        <div className="flex items-center justify-center gap-1.5 max-w-2xl mx-auto">
            {
                countArray.map((_, i) => (
                    <span className="relative h-2 rounded-md w-full bg-black/50" key={i}>
                        <span 
                            className="absolute duration-200 left-0 top-0 h-full bg-white rounded-md"
                            style={{ width: index > i ? "100%" : index < i ? "0%" : `${(timePassed / time) * 100}%` }}
                        />
                    </span>
                ))
            }
        </div>
    );
}

export default StoriesProgressBar;