import clsx from "clsx";
import React, { RefObject, useCallback, useLayoutEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
    children?: React.ReactNode;
    className?: string;
    triggerRef?: RefObject<HTMLDivElement | null>;
    defaultExpandDirection?: "up" | "down";
}

const Menu: React.FC<Props> = ({ children, className, triggerRef, defaultExpandDirection = "down" }) => {

    const [expandDirection, setExpandDirection] = useState<"down" | "up">(defaultExpandDirection);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const handleDirection = useCallback(() => {
        if (triggerRef?.current && menuRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - triggerRect.bottom;
            const spaceAbove = triggerRect.top;
            const menuHeight = menuRef.current.offsetHeight;

            if (spaceBelow > menuHeight && spaceAbove < menuHeight) {
                setExpandDirection("down");
            } 
            else {
                setExpandDirection("up");
            }
        }
    }, [triggerRef]);

    useLayoutEffect(() => {
        handleDirection();
    }, [handleDirection]);

    return (
        <div 
            ref={menuRef}
            onMouseDown={e => e.preventDefault()}
            className={twMerge(clsx("text-sm z-10 overflow-hidden font-semibold absolute right-0 bg-background shadow-lg rounded-lg divide-y divide-border-primary", {
                "-top-1 -translate-y-full": expandDirection === "up",
                "-bottom-1 translate-y-full": expandDirection === "down"
            }), className)}
        >
            {children}
        </div>
    );
}

export default Menu;