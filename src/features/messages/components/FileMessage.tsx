import IconButton from "@/features/common/components/IconButton";
import { formatFileSize } from "@/features/common/lib/utils";
import { useTransition } from "react";
import { FaDownload, FaFile } from "react-icons/fa";

type Props = {
    filePath: string;
    fileName: string;
    fileSize: number;
}

const FileMessage: React.FC<Props> = ({ filePath, fileName, fileSize }) => {
    
    const [isPending, startTransition] = useTransition();

    const handleDownload = () => {
        startTransition(async () => {
            try {
                const res = await fetch(filePath);
                const link = document.createElement("a");
                link.href = URL.createObjectURL(await res.blob());
                link.download = fileName;
                link.click();
                link.remove();
                URL.revokeObjectURL(link.href);
            }
            catch(error) {
                console.log(error);
            }
        });
    }

    return (
        <div className="flex items-center justify-between shadow-lg rounded-lg p-5 max-w-md">
            <div className="flex items-center gap-3">
                <FaFile size={32} className="text-primary" />
                <div className="text-xs">
                    <p className="font-semibold">{fileName}</p>
                    <p className="text-muted">{formatFileSize(fileSize)}</p>
                </div>
            </div>
            <IconButton disabled={isPending} onClick={handleDownload}>
                <FaDownload size={20} className="text-primary" />
            </IconButton>
        </div>
    );
}

export default FileMessage;