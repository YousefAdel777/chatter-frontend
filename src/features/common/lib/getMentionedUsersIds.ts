import { JSONContent } from "@tiptap/react";

const getMentionedUsersIds = (doc: JSONContent) => {
    const ids = new Set();

    const traverse = (node?: JSONContent) => {
        if (!node) return;
        if (node.type === "mention" && node.attrs?.id) {
            ids.add(node.attrs.id);
        }
        if (node.content) {
            node.content.forEach(traverse);
        }
    }

    traverse(doc);
    return ids;
}

export default getMentionedUsersIds;