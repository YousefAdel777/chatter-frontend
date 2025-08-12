import AudioPlayer from "@/features/common/components/AudioPlayer";

type Props = {
    file: string;
}

const AudioMessage: React.FC<Props> = ({ file }) => {

    return (
        <div className="max-w-96 mt-1">
            <AudioPlayer src={file} />
        </div>
    );
}

export default AudioMessage;