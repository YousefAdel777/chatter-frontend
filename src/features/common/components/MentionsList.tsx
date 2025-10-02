import React, {
    useEffect,
    useImperativeHandle,
    useState,
    forwardRef,
} from "react";
import Avatar from "./Avatar";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

type Props = {
    items: MentionSuggestion[];
    command: (item: { id: string, label: string }) => void;
};

type MentionsListRef = {
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

const MentionsList = forwardRef<MentionsListRef, Props>(
    ({ items, command }, ref) => {
        const [selectedIndex, setSelectedIndex] = useState(0);
        const selectItem = (index: number) => {
        const item = items[index];
            if (item) {
                command({ id: item.id, label: item.label });
            }
        };

        const upHandler = () => {
            setSelectedIndex((selectedIndex + items.length - 1) % items.length);
        };

        const downHandler = () => {
            setSelectedIndex((selectedIndex + 1) % items.length);
        };

        const enterHandler = () => {
            selectItem(selectedIndex);
        };

        useEffect(() => setSelectedIndex(0), [items]);

        useImperativeHandle(ref, () => ({
            onKeyDown: ({ event }) => {
                if (event.key === "ArrowUp") {
                    upHandler();
                    return true;
                }

                if (event.key === "ArrowDown") {
                    downHandler();
                    return true;
                }

                if (event.key === "Enter") {
                    enterHandler();
                    return true;
                }

                return false;
            },
        }));

        if (!items.length) {
            return null;
        }

        return (
            <div className="dropdown-menu">
                {
                    items.map((item, index) => (
                        <button
                            // className={index === selectedIndex ? "is-selected" : ""}
                            className={twMerge("flex gap-1 items-center", clsx({
                                "is-selected": index === selectedIndex,
                            }))}
                            key={item.id}
                            onClick={() => selectItem(index)}
                        >
                            <Avatar size={20} image={item.image} alt={`${item.label} avatar`} />
                            <span>{item.label}</span>
                        </button>
                    ))
                }
            </div>
        );
    }
);

MentionsList.displayName = "MentionsList";
export default MentionsList;