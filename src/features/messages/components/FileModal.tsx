import Modal from "@/features/common/components/Modal";

type Props = {
    closeModal: () => void;
}

const FileModal: React.FC<Props> = ({ closeModal }) => {
    return (
        <Modal closeModal={closeModal} title="Upload File">
            
        </Modal>
    )
}

export default FileModal;