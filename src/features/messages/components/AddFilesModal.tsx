"use client";

import Button from "@/features/common/components/Button";
import Modal from "@/features/common/components/Modal";
import { useState, useTransition } from "react";
import Dropzone from "react-dropzone";
import { FaFile } from "react-icons/fa";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { createMessageMutationAfter, createMessageMutationBefore } from "../mutations";
import { formatFileSize } from "@/features/common/lib/utils";
import { useMessagesContext } from "../contexts/MessagesContextProvider";
import { createMessageWithFiles } from "../actions";

type Props = {
    userId?: number;
    chatId?: number;
    replyMessageId?: number;
    closeModal: () => void;
}

const AddFilesModal: React.FC<Props> = ({ userId, chatId, closeModal, replyMessageId }) => {
    
    const [file, setFile] = useState<File | null>(null);
    const [isPending, startTransition] = useTransition();
    const { paginatedDataAfter, paginatedDataBefore, mutateAfter, mutateBefore, hasMoreAfter } = useMessagesContext();

    const handleDrop = (acceptedFiles: File[]) => {
        setFile(acceptedFiles[0]);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId && !chatId) return;
        startTransition(async () => {
            const formData = new FormData();
            formData.append("message", new Blob([JSON.stringify({
                chatId,
                userId,
                messageType: "FILE",
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

    return (
        <Modal closeModal={closeModal} title="Add File">
            <form onSubmit={handleSubmit}>
                <Dropzone multiple={false} onDrop={handleDrop}>
                    {({ getRootProps, getInputProps }) => (
                        <div {...getRootProps()} >
                            <input {...getInputProps()} />
                            {
                                !file ?
                                <div className="flex flex-col items-center gap-2 text-center relative cursor-pointer rounded-xl border-2 border-dashed border-border-primary hover:border-primary w-full h-80 justify-center transition-200">
                                    <FaFile className="text-5xl text-primary" />
                                    <p className="text-sm text-muted">
                                        Drag &amp; drop your files here, or click to select files
                                    </p>
                                </div>
                                :
                                <div>
                                    <div className="flex mb-3 cursor-pointer w-fit bg-background-secondary items-center gap-2 rounded-lg px-2 py-1.5">
                                        <FaFile size={18} className="text-primary" />
                                        <span className="text-sm font-semibold">
                                            Replace
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 shadow-lg rounded-lg p-5 ">
                                        <FaFile size={32} className="text-primary" />
                                        <div className="text-xs">
                                            <p className="font-semibold">{file.name}</p>
                                            <p className="text-muted">{formatFileSize(file.size)}</p>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    )}
                </Dropzone>
                <Button disabled={!file || isPending} className="ml-auto mt-4">
                    Send
                </Button>
            </form>
        </Modal>
    );
}

export default AddFilesModal;