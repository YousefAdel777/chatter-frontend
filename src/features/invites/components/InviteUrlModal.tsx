import Button from "@/features/common/components/Button";
import Modal from "@/features/common/components/Modal";
import { useEffect, useRef, useState } from "react";
import { FaRegCopy } from "react-icons/fa6";

type Props = {
    url: string;
    closeModal: () => void;
}

const InviteUrlModal: React.FC<Props> = ({ url, closeModal }) => {

    const [isCopied, setIsCopied] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>(null);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    }

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
        e.currentTarget.select();
        handleCopy();
    }

    useEffect(() => {
        return () =>  {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        }
    }, []);
    
    return (
        <Modal title="Invite URL" closeModal={closeModal}>
            <div className="flex min-h-60 flex-col justify-between items-end">
                <div className="w-full">
                    <p className="text-sm font-semibold mb-2">Please copy invite URL: </p>
                    <div className="flex items-center">
                        <input
                            value={url}
                            readOnly
                            type="text"
                            onClick={handleClick}
                            className="form-input m-0 rounded-r-none"
                        />
                        <button className="text-muted bg-background-secondary flex items-center justify-center w-16 h-11 text-xs font-semibold rounded-r-md" onClick={handleCopy}>
                            { isCopied ? "Copied!" : <FaRegCopy size={18} /> }
                        </button>
                    </div>
                </div>
                <Button onClick={closeModal}>
                    Done
                </Button>
            </div>
        </Modal>
    );
}

export default InviteUrlModal;