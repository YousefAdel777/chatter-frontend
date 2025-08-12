type Props = {
    content: string;
    textColor: string;
    backgroundColor: string;
    setContent?: (content: string) => void;
    setIsPaused?: (paused: boolean) => void;
}

const TextStory: React.FC<Props> = ({ content, textColor, backgroundColor, setContent, setIsPaused }) => {

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (setContent) {
            setContent(e.target.value);
        }
    }

    const handleOnMouseDown = () => {
        if (!setIsPaused) return;
        setIsPaused(true);
    }

    const handleOnMouseUp = () => {
        if (!setIsPaused) return;
        setIsPaused(false);
    }

    return (
        <div 
            onMouseDown={handleOnMouseDown} 
            onMouseUp={handleOnMouseUp}
            onTouchStart={handleOnMouseDown}
            onTouchEnd={handleOnMouseUp}
            className="flex items-center justify-center h-full px-10" 
            style={{ background: backgroundColor, color: textColor }}
        >
            <textarea 
                className={`text-center resize-none max-h-56 w-full font-semibold text-4xl outline-none bg-transparent placeholder:text-[${textColor}]/10 ${!content ? "border-b-4" : ""} ${!setContent ? "pointer-events-none selection:bg-transparent" : ""}`}
                style={{ color: textColor, borderColor: textColor }}
                value={content}
                onChange={handleChange}
                placeholder="Story Text..."
                maxLength={255}
                disabled={!setContent}
            />
        </div>
    );
}

export default TextStory;