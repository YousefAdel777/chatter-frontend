import { useMemo } from "react";
import useSWRInfinite from "swr/infinite";
import gifFetcher from "../lib/gifFetcher";

const useGifPagintation = <T>(url: string, pageSize: number, q?: string, ids?: string) => {
    const getKey = (pageIndex: number, previousPageData: PaginatedResponse<T>) => {
        if (previousPageData && previousPageData.last) return null;
        const res = new URL(url);
        res.searchParams.append("limit", pageSize.toString());
        res.searchParams.append("offset", (pageSize * pageIndex).toString());
        if (q?.length) {
            res.searchParams.append("q", q);
        }
        if (ids?.length) {
            res.searchParams.append("ids", ids);
        }
        return res.toString();
    }
    const { data, isLoading, error, size, setSize } = useSWRInfinite<GifPageResponse<T>>(getKey, gifFetcher);
    const hasMore = data && data?.[data.length - 1]?.pagination && data?.[data.length - 1]?.pagination?.total_count >= data?.[data.length - 1].pagination.offset + pageSize;
    const paginatedData = useMemo(() => data ? data.flatMap(d => d?.data || []) : [], [data]);

    return {
        paginatedData,
        isLoading,
        error,
        size,
        hasMore,
        setSize
    }
}

export default useGifPagintation;