import useSWRInfinite from "swr/infinite";
import fetcher from "../lib/fetcher";

const useCursorPagination = <T>(url: string | null, pageSize: number) => {
    const getKey = (pageIndex: number, previousPageData: CursorResponse<T>) => {
        if (!url) return null;
        if (previousPageData && !previousPageData.content) return null;
        const separator = url.indexOf("?") === -1 ? "?" : "&";
        if (pageIndex === 0) return `${url}${separator}&size=${pageSize}`;
        return `${url}${separator}cursor=${previousPageData.nextCursor}&size=${pageSize}`;
    }
    const { data: paginatedData, isLoading, error, size, mutate, setSize } = useSWRInfinite<PaginatedResponse<T>>(getKey, fetcher);
    const pageCount = paginatedData?.reduce((acc, page) => acc + page.content.length, 0);
    
    return {
        paginatedData,
        isLoading,
        error,
        size,
        pageCount,
        mutate,
        setSize
    }
}

export default useCursorPagination;