import { useFiltersContext } from "@/features/chats/contexts/FiltersContextProvider";
import Button from "@/features/common/components/Button";
import Image from "next/image";

const NoMessages: React.FC = () => {
    const { isFiltered, resetFilters } = useFiltersContext() as FiltersContextType;
    return (
        <div className="h-full mt-16 flex justify-center items-center">
            {
                isFiltered ?
                <div className="space-y-3 mt-8 flex items-center justify-center flex-col">
                    <h2 className="text-center text-xl font-semibold text-muted">
                        No messages matching selected filters
                    </h2>
                    <Button onClick={resetFilters}>
                        Reset Filters
                    </Button>
                </div>
                :
                <div className="relative w-80 h-80">
                    <Image fill src="/no_messages.svg" alt="message friends" />
                </div>
            }
        </div>
    );
}

export default NoMessages;