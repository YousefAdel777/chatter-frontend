import { FaEnvelope, FaFile, FaImage, FaPhone } from "react-icons/fa";
import { useFiltersContext } from "../contexts/FiltersContextProvider";
import Menu from "@/features/common/components/Menu";
import { useMemo, useState } from "react";
import MenuItem from "@/features/common/components/MenuItem";
import { FaMessage } from "react-icons/fa6";
import FilterButton from "@/features/common/components/FilterButton";
import { IoText } from "react-icons/io5";
import { MdWebStories } from "react-icons/md";
import { HiSpeakerWave } from "react-icons/hi2";


type MessageTypeObject = {
    icon: React.ReactNode,
    text: string;
    value: MessageType | null;
}

const messageTypes: Readonly<MessageTypeObject[]> = [
    {
        icon: <FaMessage size={18} />,
        text: "All",
        value: null,
    },
    {
        icon: <IoText size={18} />,
        text: "Text",
        value: "TEXT"
    },
    {
        icon: <FaImage size={18} />,
        text: "Media",
        value: "MEDIA"
    },
    {
        icon: <HiSpeakerWave size={18} />,
        text: "Audio",
        value: "AUDIO"
    },
    {
        icon: <FaFile size={18} />,
        text: "File",
        value: "FILE"
    },
    {
        icon: <MdWebStories size={18} />,
        text: "Story",
        value: "STORY"
    },
    {
        icon: <FaPhone size={18} />,
        text: "Call",
        value: "CALL"
    },
    {
        icon: <FaEnvelope size={18} />,
        text: "Invite",
        value: "INVITE"
    },
]

const MessageTypeFilter: React.FC = () => {

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { messageType, setMessageType } = useFiltersContext() as FiltersContextType;
    const selectedType = useMemo(() => messageTypes.find(msgType => msgType.value === messageType), [messageType]);

    const handleSelect = (value: MessageType | null) => {
        setIsMenuOpen(false);
        setMessageType(value);
    }

    return (
        <div className="relative">
            <FilterButton            
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                onBlur={() => setIsMenuOpen(false)}
                tabIndex={-1} 
                className="text-primary text-sm font-semibold"
            >
                <div className="text-primary">
                    {selectedType?.icon}
                </div>
                {selectedType?.text}
            </FilterButton>
            {
                isMenuOpen &&
                <Menu>
                    {
                        messageTypes.map(msgType => (
                            <MenuItem key={msgType.value} onClick={() => handleSelect(msgType.value)}>
                                <div className="text-primary">
                                    {msgType.icon}
                                </div>
                                {msgType.text}
                            </MenuItem>
                        ))
                    }
                </Menu>
            }
        </div>
    );
}

export default MessageTypeFilter;