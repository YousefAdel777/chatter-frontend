"use client"

import { useEditor, EditorContent, JSONContent, Editor as TipTapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useMemo, useState } from "react";
import Mention from "@tiptap/extension-mention";
import suggestionFactory from "../lib/suggestionFactory";
import Link from "@tiptap/extension-link";
import { createPortal } from "react-dom";
import UserModal from "@/features/users/components/UserModal";

type Props = {
    value: string;
    valueJson?: JSONContent;
    editable?: boolean;
    mentionSuggestions?: MentionSuggestion[];
    mentions?: Mention[];
    handleChange?: (value: string, valueJson: JSONContent) => void;
    enableMentions?: boolean;
    ref?: React.RefObject<TipTapEditor | null>;
}

const Editor: React.FC<Props> = ({ ref, value, enableMentions, valueJson, editable, mentionSuggestions, mentions, handleChange }) => {
    const [mentionedUserId, setMentionedUserId] = useState("");
    const mentionedUser = useMemo(() => mentions?.find(mention => mention.user.id.toString() === mentionedUserId)?.user, [mentions, mentionedUserId]);

    const editor = useEditor({
        extensions: [
            StarterKit, 
            Link.configure({
                autolink: true,
                openOnClick: true,
                linkOnPaste: true,
                validate: href => /^https?:\/\//.test(href),
            }),
            Mention.configure({
                HTMLAttributes: {
                    class: "mention",
                },
                renderHTML({ node }) {
                    let label = node.attrs.label;
                    if (!editable && node.attrs.id !== "everyone") {
                        const user = mentions?.find(mention => mention.user.id.toString() === node.attrs.id)?.user;
                        label = user?.username || "deleted-user";
                    }
                    return [
                        "span",
                        {
                            class: "mention",
                            "data-id": node.attrs.id,
                        },
                        `${node.attrs.mentionSuggestionChar}${label}`,
                    ]
                },
                suggestion: enableMentions ? suggestionFactory(mentionSuggestions || []) : {},
            }),
        ],
        content: valueJson || value,
        immediatelyRender: false,
        onUpdate: (e) => {
            if (handleChange) {
                handleChange(e.editor.getText(), e.editor.getJSON());
            }
        },
        editable: !!editable,
    }, [mentionSuggestions, mentions]);

    useEffect(() => {
        editor?.view.dom.addEventListener("click", (e) => {
            const target = (e.target as HTMLElement).closest(".mention");
            if (target) {
                const id = target.getAttribute("data-id");
                if (!editable && id && id !== "everyone") {
                    setMentionedUserId(id);
                }
            }
        });
    }, [editor, editable]);

    useEffect(() => {
        if (editor && ref) {
            ref.current = editor;
        }
    }, [editor, ref]);

    useEffect(() => {
        if (editor && editor.getText() !== value) {
            editor.commands.setContent(valueJson || null);
        }
    }, [valueJson, value, editor]);

    return (
        <>
            {
                mentionedUser &&
                createPortal(
                    <UserModal user={mentionedUser} closeModal={() => setMentionedUserId("")} />,
                    document.body
                )
            }
            <EditorContent editor={editor} />
        </>
    );
}

export default Editor;