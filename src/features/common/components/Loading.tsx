type Props = {
    size?: number;
}

const Loading: React.FC<Props> = ({ size = 40 }) => {
    return (
        <div className="flex my-4 items-center justify-center">
            <span
                style={{ width: size, height: size }}
                className="border-4 border-t-primary border-border-primary rounded-full animate-spin"
            />
        </div>
    );
}

export default Loading;