import { useState } from "react";
import MediaModal from "./MediaModal";
import { createPortal } from "react-dom";
import Image from "next/image";
import Player from "next-video/player";

type Props = {
    attachments: Attachment[];
}

const MediaMessage: React.FC<Props> = ({ attachments }) => {
    const [attachmentIndex, setAttachmentIndex] = useState<number | null>(null);

    return (
        <div className="grid grid-cols-2 gap-1">
            {
                attachmentIndex !== null &&
                createPortal(
                    <MediaModal 
                        startIndex={attachmentIndex}
                        closeModal={() => setAttachmentIndex(null)} 
                        attachments={attachments} 
                    />,
                    document.body
                )
            }
            {
                attachments.map((attachment, i) => (
                    i > 3 ?
                    null
                    :
                    <div onClick={() => setAttachmentIndex(i)} key={attachment.id} className="relative w-36 h-36 rounded-md overflow-hidden">
                        {
                            attachment.attachmentType === "IMAGE" ?
                            <Image 
                                key={attachment.id} 
                                src={attachment.filePath} 
                                fill
                                alt="attachment" 
                                className="object-cover cursor-pointer" 
                            />
                            :
                            <Player disablePictureInPicture controls={false} onClick={e => e.preventDefault()} src={attachment.filePath} />
                        }
                        {
                            i === 3 && attachments.length > 4 &&
                            <div className="absolute w-full h-full text-white font-bold flex items-center justify-center bg-black/50" >
                                +{attachments.length - 4}
                            </div>
                        }
                    </div>
                ))
            }
        </div>
    );
}

export default MediaMessage;