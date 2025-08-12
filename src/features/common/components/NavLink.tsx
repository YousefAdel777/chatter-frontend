"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
    href: string;
    children?: React.ReactNode;
}

const NavLink: React.FC<Props> = ({ href, children }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link className={clsx("w-10 h-10 flex items-center justify-center rounded-full hover:bg-background-secondary duration-200", {
            "bg-primary/30 text-primary": isActive,
            "text-muted": !isActive,
        })} href={href}>
            {children}
        </Link>
    );
}

export default NavLink;