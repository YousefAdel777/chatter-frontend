import IconButton from "@/features/common/components/IconButton";
import { useState, useRef, useEffect, useTransition } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record";
import { BsFillRecordFill } from "react-icons/bs";
import { FaStop } from "react-icons/fa";
import AudioPlayer from "@/features/common/components/AudioPlayer";
import { FiSend, FiX } from "react-icons/fi";
import clsx from "clsx";
import { createMessageWithFiles } from "../actions";
import { useMessagesContext } from "../contexts/MessagesContextProvider";
import { createMessageMutationAfter, createMessageMutationBefore } from "../mutations";

type Props = {
    chatId?: number,
    userId?: number,
    replyMessageId?: number;
}

const Recorder: React.FC<Props> = ({ chatId, userId, replyMessageId }) => {
    
    const micContainerRef = useRef<HTMLDivElement | null>(null);
    const [recording, setRecording] = useState(false);
    const [recordedUrl, setRecordedUrl] = useState("");
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [, setWaveSurfer] = useState<WaveSurfer>();
    const [recordPlugin, setRecordPlugin] = useState<RecordPlugin>();
    const [isPending, startTransition] = useTransition();
    const { paginatedDataAfter, paginatedDataBefore, mutateAfter, mutateBefore } = useMessagesContext() ;

    useEffect(() => {
        if (!micContainerRef.current) return;
        const wavesurferInstance = WaveSurfer.create({
            container: micContainerRef.current,
            waveColor:"#60a5fa",
            progressColor:"#3b82f6",
            height: 50,
            barGap: 2,
            barWidth: 4,
            minPxPerSec: 0.5,
            sampleRate: 8000
        });
        setWaveSurfer(wavesurferInstance);
        const recordPluginInstance = RecordPlugin.create();
        setRecordPlugin(recordPluginInstance);
        wavesurferInstance.registerPlugin(recordPluginInstance);
        recordPluginInstance.on("record-end", (blob) => {
            setRecordedBlob(blob)
            const recordedUrl = URL.createObjectURL(blob);
            setRecordedUrl(recordedUrl);
        });
        return () => {
            wavesurferInstance.destroy();
        };
    }, []);

    useEffect(() => {
        return () => {
            if (recordedUrl) URL.revokeObjectURL(recordedUrl);
        }
    }, [recordedUrl]);

    const handleRecordClick = () => {
        if (recordPlugin) {
            if (recordPlugin.isRecording()) {
                recordPlugin.stopRecording();
                setRecording(false);
            } 
            else {
                recordPlugin.startRecording().then(() => {
                    setRecording(true);
                });
            }
        }
    };

    const handleSubmit = () => {
        if (!recordedBlob) return;
        startTransition(async () => {
            const file = new File([recordedBlob], "filename.mp3", {
                type: recordedBlob.type, 
                lastModified: Date.now(),
            });
            const formData = new FormData();
            formData.append("message", new Blob([JSON.stringify({ 
                chatId,
                userId,
                messageType: "AUDIO",
                replyMessageId: replyMessageId
            })], { type: "application/json" }));
            formData.append("file", file);
            const createdMessage = await createMessageWithFiles(formData);
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
            handleReset();
        });
    }

    const handleReset = () => {
        setRecordedBlob(null);
        setRecordedUrl("");
    }

    return (
        <div className="bg-background py-1.5 px-2 relative z-10">
            {
                recordedUrl &&
                <div className="flex items-center justify-center gap-2.5">
                    <AudioPlayer src={recordedUrl} />
                    <IconButton disabled={isPending} onClick={handleReset}>
                        <FiX size={20} className="text-primary" />
                    </IconButton>
                    <IconButton disabled={isPending} onClick={handleSubmit}>
                        <FiSend size={20} className="text-primary" />
                    </IconButton>
                </div>
            }
            <div className={clsx("flex items-center gap-2.5", { "hidden": recordedUrl })}>
                <IconButton className="text-primary" onClick={handleRecordClick}>
                    {recording ? <FaStop size={20} /> : <BsFillRecordFill size={22} />}
                </IconButton>
                <div ref={micContainerRef} className={clsx("overflow-hidden flex-1", { "hidden": !recording })} />
            </div>
        </div>
    );
};

export default Recorder;
