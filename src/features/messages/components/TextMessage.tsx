import Editor from "@/features/common/components/Editor";

type Props = {
    message: Message;
}

const TextMessage: React.FC<Props> = ({ message }) => {

    return (
        <div className="prose dark:prose-invert prose-a:text-primary break-words text-wrap">
            {/* <Markdown rehypePlugins={[remarkGfm]}>
                {message.content}
            </Markdown> */}
            <Editor mentions={message.mentions} value={message.content || ""} valueJson={message.contentJson ? JSON.parse(message.contentJson) : null}  />
        </div>
    );
}

export default TextMessage;