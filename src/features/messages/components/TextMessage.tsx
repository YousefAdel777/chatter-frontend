import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
    message: Message;
}

const TextMessage: React.FC<Props> = ({ message }) => {

    return (
        <div className="prose dark:prose-invert prose-a:text-primary break-words text-wrap">
            <Markdown rehypePlugins={[remarkGfm]}>
                {message.content}
            </Markdown>
        </div>
    );
}

export default TextMessage;