import { useEffect, useState, useTransition } from "react";
import { createStory } from "../actions";
import IconButton from "@/features/common/components/IconButton";
import { FiSend, FiX } from "react-icons/fi";
import Dropzone from "react-dropzone";
import { FaImage } from "react-icons/fa";
import Image from "next/image";
import Player from "next-video/player";
import { createPortal } from "react-dom";
import PhotoEditor from "@/features/common/components/PhotoEditor";
import ExcludedUsersModal from "./ExcludedUsersModal";
import ErrorMessage from "@/features/common/components/ErrorMessage";

type Props = {
    closeModal: () => void;
}

const MediaStoryModal: React.FC<Props> = ({ closeModal }) => {

    const [isPending, startTransition] = useTransition();
    const [errorMessage, setErrorMessage] = useState("");
    const [showEditor, setShowEditor] = useState(false);
    const [content, setContent] = useState("");
    const [filePreview, setFilePreview] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [showExcludedUsersModal, setShowExcludedUsersModal] = useState(false);
    const [excludedUsersIds, setExcludedUsersIds] = useState<number[]>([]);

    const toggleExclusion = (userId: number) => {
        if (excludedUsersIds.includes(userId)) {
            setExcludedUsersIds(prevState => prevState.filter(id => id !== userId));
        }
        else {
            setExcludedUsersIds(prevState => [...prevState, userId]);
        }
    }

    const handleDrop = (acceptedFiles: File[]) => {
        setFilePreview(URL.createObjectURL(acceptedFiles[0]));
        if (acceptedFiles[0].type.startsWith("image")) {
            setShowEditor(true);
        }
        else {
            setFile(acceptedFiles[0]);
        }
    }

    const handleSubmit = () => {
        setErrorMessage("");
        if (!file) return;
        startTransition(async () => {
            const formData = new FormData();
            formData.append('story', new Blob([JSON.stringify({
                content,
                excludedUsersIds,
                storyType: file.type.startsWith("image") ? "IMAGE" : "VIDEO"
            })], {
                type: 'application/json'
            }));
            formData.append("file", file);
            const res = await createStory(formData);
            if (res.error) {
                setErrorMessage(res.error);
                return;
            }
            setContent("");
            setFile(null);
            setFilePreview("");
        });
    }

    const handleSave = (file: File | null) => {
        setFile(file);
        if (file) setFilePreview(URL.createObjectURL(file));
        setShowEditor(false);
    }

    useEffect(() => {
        return () => {
            if (filePreview) URL.revokeObjectURL(filePreview);
        }
    }, [filePreview]);

    return (
        <div className="absolute overflow-hidden left-0 top-0 w-full h-full bg-background-secondary">
            {
                showEditor &&
                createPortal(
                    <PhotoEditor filePreview={filePreview} handleSave={handleSave} closeModal={() => setShowEditor(false)} />,
                    document.body
                )
            }
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
            <div className="flex z-10 absolute top-0 left-0 w-full items-center justify-end bg-black/30 px-3 py-2.5">
                <IconButton onClick={closeModal}>
                    <FiX size={22} className="text-white" />
                </IconButton>
            </div>
            <div className="relative h-full flex items-center justify-center">
                <Dropzone multiple={false} accept={{ "image/*": [], "video/*": [] }} onDrop={handleDrop}>
                    {({ getRootProps, getInputProps }) => (
                        <>
                            {
                                !file ?
                                <div className="cursor-pointer flex items-center justify-center w-full" {...getRootProps()} >
                                    <input {...getInputProps()} />
                                    <div className="flex max-w-lg flex-col items-center gap-2 text-center relative cursor-pointer rounded-xl border-2 border-dashed border-border-primary hover:border-primary w-full h-80 justify-center transition-200">
                                        <FaImage className="text-5xl text-primary" />
                                        <p className="text-sm text-muted">
                                            Drag &amp; drop your files here, or click to select files
                                        </p>
                                    </div>
                                </div>
                                :
                                <div>
                                    <div {...getRootProps()} className="flex absolute left-10 top-20 z-20 mb-3 cursor-pointer w-fit bg-background-secondary items-center gap-2 rounded-lg px-2 py-1.5">
                                        <input disabled={isPending} {...getInputProps()} />
                                        <FaImage size={18} className="text-primary" />
                                        <span className="text-sm font-semibold">
                                            Change
                                        </span>
                                    </div>
                                    {
                                        filePreview && !showEditor &&
                                        <>
                                            {
                                                file?.type.startsWith("image") ?
                                                <Image fill unoptimized quality={100} priority className="object-contain relative min-w-40" src={filePreview} alt="Story image" />
                                                :
                                                <Player  controls src={filePreview} className="max-h-svh object-contain relative duration-150" />
                                            }
                                        </>
                                    }
                                </div>
                            }
                        </>
                    )}
                </Dropzone>
            </div>
            <div className="flex flex-col items-center justify-center gap-1  absolute bottom-0 left-0 w-full bg-black/30 px-6 py-3">
                <div className="flex gap-3 items-center justify-between">
                    <button 
                        onClick={() => setShowExcludedUsersModal(true)}
                        className="text-white text-sm font-semibold text-nowrap"
                    >
                        Exclude Users
                    </button>
                    <input
                        type="text"
                        placeholder="Write Something..."
                        className="form-input m-0"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                    />
                    <IconButton disabled={isPending || !file} className="bg-background" onClick={handleSubmit}>
                        <FiSend className="text-primary" size={22} />
                    </IconButton>
                </div>
                <ErrorMessage message={errorMessage} isActive={!!errorMessage} />
            </div>
        </div>
    );
}

export default MediaStoryModal;