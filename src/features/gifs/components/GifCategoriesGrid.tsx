import Loading from "@/features/common/components/Loading";
import MasonryGrid from "@/features/common/components/MasonryGrid";
import GifCategory from "./GifCategory";
import { useCallback, useEffect, useRef } from "react";
import useGifPagintation from "../hooks/useGifPagination";

type Props = {
    handleCategoryClick: (name: string) => void;
}

const CATEGORIES_PAGE_SIZE = 30;

const GifCategoriesGrid: React.FC<Props> = ({ handleCategoryClick }) => {

    const { paginatedData, setSize, hasMore, isLoading, error } = useGifPagintation<GifCategory>("https://api.giphy.com/v1/gifs/categories", CATEGORIES_PAGE_SIZE);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

    const loadMore = useCallback(() => {
        if (timeoutRef.current || !hasMore) return;
        timeoutRef.current = setTimeout(() => {
            setSize(prev => prev + 1);
            timeoutRef.current = null;
        }, 500);
    }, [setSize, hasMore]);

    useEffect(() => {
        if (!paginatedData) {
            loadMore();
        }
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        }
    }, []);

    return (
        <div className="h-80">
            {
                isLoading && (!paginatedData || paginatedData.length === 0) ?
                <Loading />
                :
                (paginatedData && paginatedData.length > 0) ?
                <MasonryGrid 
                    data={paginatedData}
                    itemContent={({ data: item }) => {
                        if (!item) return null;
                        return <GifCategory gifCatgeory={item} onClick={() => handleCategoryClick(item.name)} key={item.name} />
                    }}
                    columnCount={2}
                    onEndReached={loadMore}
                />
                :
                <div className="flex items-center justify-center h-full">
                    <p className="text-center text-muted text-sm font-semibold select-none">
                        { error ? "Something went wrong" : "No categories found" }
                    </p>
                </div>
            }
        </div>
    )
}

export default GifCategoriesGrid;