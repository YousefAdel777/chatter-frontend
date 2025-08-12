import { useState } from "react";
import useDebounce from "../hooks/useDebounce";
import useSWR from "swr";
import Loading from "@/features/common/components/Loading";
import SearchResult from "./SearchResult";
import { createPortal } from "react-dom";
import UserModal from "@/features/users/components/UserModal";
const PAGE_SIZE = 4;


const SearchBar: React.FC = () => {

    const [search, setSearch] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [user, sertUser] = useState<User | null>(null);
    const { debouncedValue: debouncedSearch } = useDebounce(search, 500);
    const { data, isLoading, error } = useSWR<PaginatedResponse<User>>(!debouncedSearch ? null :  `/api/users?username=${debouncedSearch}&email=${debouncedSearch}&page=0&size=${PAGE_SIZE}`);

    const searchResults = (
        isLoading ?
        <Loading />
        :
        error ?
        <h2 className="text-2xl font-bold my-4">
            Something went wrong
        </h2>
        :
        data?.content?.map((user) => (
            <SearchResult key={user.id} onClick={() => sertUser(user)} user={user} />
        ))
    );

    return (
        <div className="relative flex-1">
            {
                user &&
                createPortal(
                    <UserModal user={user} closeModal={() => sertUser(null)} />,
                    document.body
                )
            }
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input m-0"
                placeholder="Search Chatter..."
                onFocus={() => setShowResults(true)}
                onBlur={() => setShowResults(false)}
            /> 
            {
                showResults && search &&
                <div 
                    onMouseDown={e => e.preventDefault()} 
                    className="absolute overflow-hidden w-full bg-background rounded-md shadow-lg space-y-2 z-20 left-1/2 -translate-x-1/2 -bottom-4 translate-y-full"
                >
                    {searchResults}
                </div>
            }
        </div>
    );
}

export default SearchBar;