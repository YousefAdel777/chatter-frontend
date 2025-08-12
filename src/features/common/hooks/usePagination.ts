import useSWRInfinite from "swr/infinite";
import fetcher from "../lib/fetcher";

const usePagination = <T>(url: string | null, pageSize: number) => {
    const getKey = (pageIndex: number, previousPageData: PaginatedResponse<T>) => {
        if (!url) return null;
        if (previousPageData && previousPageData.last) return null;
        const separator = url.indexOf("?") === -1 ? "?" : "&";
        return `${url}${separator}page=${pageIndex}&size=${pageSize}`;
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

export default usePagination;