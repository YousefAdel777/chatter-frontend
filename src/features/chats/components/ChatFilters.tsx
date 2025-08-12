import FilterButton from "@/features/common/components/FilterButton";
import { BsFillPinAngleFill } from "react-icons/bs";
import { FaStar } from "react-icons/fa";
import { useFiltersContext } from "../contexts/FiltersContextProvider";
import MessageTypeFilter from "./MessageTypeFilter";

const ChatFilters: React.FC = () => {

    const { pinned, starred, search, togglePinned, toggleStarred, setSearch, } = useFiltersContext() as FiltersContextType;

    return (
        <div className="flex flex-col-reverse md:flex-row gap-3 items-center bg-background shadow-lg px-3 py-2">
            <div className="flex gap-2 flex-wrap">
                <FilterButton className="text-primary font-semibold text-sm" active={pinned} onClick={togglePinned}>
                    <BsFillPinAngleFill size={18} />
                    Pinned
                </FilterButton>
                <FilterButton className="text-primary font-semibold text-sm" active={starred} onClick={toggleStarred}>
                    <FaStar size={18} />
                    Starred
                </FilterButton>
                <MessageTypeFilter />
            </div>
            <div className="flex-1 w-full md:w-fit">
                <input 
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="form-input m-0"
                />
            </div>
        </div>
    );
}

export default ChatFilters;