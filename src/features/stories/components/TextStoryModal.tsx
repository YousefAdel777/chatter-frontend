import IconButton from "@/features/common/components/IconButton";
import {  useEffect, useRef, useState, useTransition } from "react";
import { HexColorPicker } from "react-colorful";
import { FiSend, FiX } from "react-icons/fi";
import { createStory } from "../actions";
import { IoColorPalette } from "react-icons/io5";
import { MdFormatColorText } from "react-icons/md";
import ExcludedUsersModal from "./ExcludedUsersModal";
import ErrorMessage from "@/features/common/components/ErrorMessage";
import { createPortal } from "react-dom";
import TextStory from "./TextStory";

type Props = {
    closeModal: () => void;
}

const DEFAULT_TEXT_COLOR = "#fff";
const DEFAULT_BACKGROUND_COLOR = "#3b82f6";

const TextStoryModal: React.FC<Props> = ({ closeModal }) => {

    const [errorMessage, setErrorMessage] = useState("");
    const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR);
    const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BACKGROUND_COLOR);
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();
    const [showTextColorSelect, setShowTextColorSelect] = useState(false);
    const [showBackgroundColorSelect, setShowBackgroundColorSelect] = useState(false);
    const [showExcludedUsersModal, setShowExcludedUsersModal] = useState(false);
    const [excludedUsersIds, setExcludedUsersIds] = useState<number[]>([]);
    const textColorPickerRef = useRef<HTMLDivElement | null>(null);
    const backgroundColorPickerRef = useRef<HTMLDivElement | null>(null);

    const handleSubmit = () => {
        setErrorMessage("");
        if (!content) return;
        startTransition(async () => {
            const formData = new FormData();
            formData.append("story", new Blob([JSON.stringify({
                textColor,
                backgroundColor,
                content,
                excludedUsersIds,
                storyType: "TEXT"
            })], { type: "application/json" }));
            const res = await createStory(formData);
            if (res.error) {
                setErrorMessage(res.error);
                return;
            }
            setContent("");
        });
    }

    const toggleExclusion = (userId: number) => {
        if (excludedUsersIds.includes(userId)) {
            setExcludedUsersIds(prevState => prevState.filter(id => id !== userId));
        }
        else {
            setExcludedUsersIds(prevState => [...prevState, userId]);
        }
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (textColorPickerRef.current && !textColorPickerRef.current.contains(e.target as Node)) {
                setShowTextColorSelect(false);
            }
            if (backgroundColorPickerRef.current && !backgroundColorPickerRef.current.contains(e.target as Node)) {
                setShowBackgroundColorSelect(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="absolute left-0 top-0 w-full h-full bg-black/20">
            {
                showExcludedUsersModal &&
                createPortal(
                    <ExcludedUsersModal 
                        excludedUsersIds={excludedUsersIds}
                        closeModal={() => setShowExcludedUsersModal(false)}
                        toggleExclusion={toggleExclusion}
                    />,
                    document.body
                )
            }
            <div className="flex items-center justify-between bg-black/30 px-6 py-2.5 absolute left-0 top-0 w-full">
                <div className="flex items-center gap-3 relative">
                    <IconButton onClick={() => setShowTextColorSelect(prevState => !prevState)}>
                        {
                            showTextColorSelect ?
                            <FiX size={22} className="text-white" />
                            :
                            <MdFormatColorText size={22} className="text-white" />
                        }
                    </IconButton>
                    <IconButton onClick={() => setShowBackgroundColorSelect(prevState => !prevState)}>
                        {
                            showBackgroundColorSelect ?
                            <FiX size={22} className="text-white" />
                            :
                            <IoColorPalette size={22} className="text-white" />
                        }
                    </IconButton>
                    {
                        showBackgroundColorSelect &&
                        <div ref={backgroundColorPickerRef} className="absolute -bottom-4 translate-y-full">
                            <HexColorPicker  color={backgroundColor} onChange={(color) => setBackgroundColor(color)} />
                        </div>
                    }
                    {
                        showTextColorSelect &&
                        <div ref={textColorPickerRef} className="absolute -bottom-4 translate-y-full">
                            <HexColorPicker color={textColor} onChange={(color) => setTextColor(color)} />
                        </div>
                    }
                </div>
                <IconButton onClick={closeModal}>
                    <FiX size={22} className="text-white" />
                </IconButton>
            </div>
            <TextStory textColor={textColor} setContent={setContent} backgroundColor={backgroundColor} content={content} />
            <div className="flex items-center justify-between absolute bottom-0 left-0 w-full bg-black/30 px-6 py-2.5">
                <button 
                    onClick={() => setShowExcludedUsersModal(true)}
                    className="text-white text-sm font-semibold hover:underline text-nowrap"
                >
                    Exclude Users
                </button>
                <ErrorMessage isActive={!!errorMessage} message={errorMessage} />
                <IconButton disabled={isPending || !content} className="bg-background" onClick={handleSubmit}>
                    <FiSend className="text-primary" size={22} />
                </IconButton>
            </div>
        </div>
    );
}

export default TextStoryModal;