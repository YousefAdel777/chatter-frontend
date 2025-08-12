"use client";

import Button from "@/features/common/components/Button";
import Modal from "@/features/common/components/Modal";
import { useEffect, useState, useTransition } from "react";
import Dropzone from "react-dropzone";
import { createMessageMutationAfter, createMessageMutationBefore } from "../mutations";
import { FaFileAudio } from "react-icons/fa";
import AudioPlayer from "@/features/common/components/AudioPlayer";
import { useMessagesContext } from "../contexts/MessagesContextProvider";
import { createMessageWithFiles } from "../actions";

type Props = {
    userId?: number;
    chatId?: number;
    replyMessageId?: number;
    closeModal: () => void;
}

const AudioModal: React.FC<Props> = ({ closeModal, replyMessageId, userId, chatId }) => {
    
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string>("");
    const [isPending, startTransition] = useTransition();
    const { mutateAfter, mutateBefore, hasMoreAfter, paginatedDataBefore, paginatedDataAfter } = useMessagesContext() as MessagesContextType;

    const handleDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        setFile(acceptedFiles[0]);
        setFilePreview(URL.createObjectURL(acceptedFiles[0]));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId && !chatId) return;
        startTransition(async () => {
            const formData = new FormData();
            formData.append("message", new Blob([JSON.stringify({ 
                userId,
                messageType: "AUDIO",
                replyMessageId: replyMessageId
            })], { type: "application/json" }));
            if (file) formData.append("file", file);
            const createdMessage = await createMessageWithFiles(formData);
            if (hasMoreAfter) return;
            if (paginatedDataAfter) {
                mutateAfter(createMessageMutationAfter(paginatedDataAfter, createdMessage), {
                    revalidate: false,
                    populateCache: true,
                    rollbackOnError: true,
                });
            }
            else if (paginatedDataBefore) {
                mutateBefore(createMessageMutationBefore(paginatedDataBefore, createdMessage), {
                    revalidate: false,
                    populateCache: true,
                    rollbackOnError: true,
                });
            }
            else {
                mutateBefore([{ content: [createdMessage], nextCursor: null, previousCursor: null }], { revalidate: false, populateCache: true, rollbackOnError: true });
            }
            closeModal();
        });
    }

    useEffect(() => {
        return () => {
            URL.revokeObjectURL(filePreview);
        }
    }, [filePreview]);

    return (
        <Modal closeModal={closeModal} title="Add Audio File">
            <form onSubmit={handleSubmit}>
                <Dropzone multiple={false} accept={{ "audio/*": [] }} onDrop={handleDrop}>
                    {({ getRootProps, getInputProps }) => (
                        <div {...getRootProps()} >
                            <input {...getInputProps()} />
                            {
                                !file ?
                                <div className="flex flex-col items-center gap-2 text-center relative cursor-pointer rounded-xl border-2 border-dashed border-border-primary hover:border-primary w-full h-80 justify-center transition-200">
                                    <FaFileAudio size={48} className="text-primary" />
                                    <p className="text-sm text-muted">
                                        Drag &amp; drop your files here, or click to select files
                                    </p>
                                </div>
                                :
                                <div className="flex mb-3 cursor-pointer w-fit bg-background-secondary items-center gap-2 rounded-lg px-2 py-1.5">
                                    <FaFileAudio size={18} className="text-primary" />
                                    <span className="text-sm font-semibold">
                                        Replace
                                    </span>
                                </div>
                            }
                        </div>
                    )}
                </Dropzone>
                {
                    file &&
                    <AudioPlayer src={filePreview} />
                }
                <Button type="submit" disabled={!file || isPending} className="ml-auto mt-4">
                    Send
                </Button>
            </form>
        </Modal>
    );
}

export default AudioModal;