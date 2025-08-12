"use client";

import Image from "next/image";
import { FaHome, FaUser } from "react-icons/fa";
import { MdWebStories } from "react-icons/md";
import ChatsContainer from "@/features/chats/components/ChatsContainer";
import { useState } from "react";
import ProfileForm from "@/features/auth/components/ProfileForm";
import Tab from "./Tab";
import StoriesContainer from "@/features/stories/components/StoriesContainer";
import { usePathname } from "next/navigation";
import clsx from "clsx";

type Props = {
    chats: Chat[];
    stories: Story[];
    user: User;
    userStories: Story[];
}

const tabs = [
    {
        id: "chats",
        icon: <FaHome size={22} />
    },
    {
        id: "profile",
        icon: <FaUser size={22} />
    },
    {
        id: "stories",
        icon: <MdWebStories size={22} />
    }
]

const Sidebar: React.FC<Props> = ({ chats, userStories, stories, user }) => {

    const [activeTab, setActiveTab] = useState("chats");
    const pathname = usePathname();

    return (
        <div 
            className={clsx("min-w-full md:min-w-80 lg:min-w-96 h-svh max-h-svh overflow-y-auto sticky px-3 py-4 shadow-lg border-r border-border-primary bg-background", {
                "hidden md:block": pathname !== "/",
            })}
        >
            <div className="flex gap-2 h-full">
                <div className="pr-2 flex flex-col gap-4 pt-8 border-r border-border-primary">
                    {
                        tabs.map(tab => (
                            <Tab key={tab.id} onClick={() => setActiveTab(tab.id)} isActive={activeTab === tab.id}>
                                {tab.icon}
                            </Tab>
                        ))
                    }
                </div>
                <div className="flex-1">
                    <div data-hide-on-theme="dark">
                        <Image  priority quality={100} src="/logo-light.svg" width={1000} height={1000} className="h-20 w-28" alt="logo"  />
                    </div>
                    <div data-hide-on-theme="light">
                        <Image  priority quality={100} src="/logo-dark.svg" width={1000} height={1000} className="h-20 w-28" alt="logo"  />
                    </div>
                    {
                        activeTab === "chats" ?
                        <ChatsContainer user={user} initialData={chats} /> 
                        :
                        activeTab === "profile" ? 
                        <ProfileForm user={user} />
                        :
                        activeTab === "stories" ?
                        <StoriesContainer userStories={userStories} stories={stories} />
                        :
                        null
                    }
                </div>
            </div>
        </div>
    );
}

export default Sidebar;