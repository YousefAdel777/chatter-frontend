import useSWR from "swr";
import Gif from "./Gif";
import { useCallback, useEffect, useMemo, useRef } from "react";
import Loading from "@/features/common/components/Loading";
import MasonryGrid from "@/features/common/components/MasonryGrid";
import usePagination from "@/features/common/hooks/usePagination";
import { deleteFavoriteGif } from "../actions";
import gifFetcher from "../lib/gifFetcher";

type Props = {
    handleGifClick: (gifId: string) => void;
    url: string;
}

const PAGE_SIZE = 20;

const FavoriteGifsGrid: React.FC<Props> = ({ handleGifClick, url }) => {

    const { paginatedData, data: favoriteGifs, setSize, hasMore, error, isLoading: isLoadingFavorites } = usePagination<FavoriteGif>("/api/favorite-gifs", PAGE_SIZE);

    const urlWithParams = useMemo(() => {
        const res = new URL(url);
        const gifsIds = favoriteGifs.map(fav => fav.gifId).join(",");
        res.searchParams.append("ids", gifsIds);
        return res.toString();
    }, [url, favoriteGifs]);

    const { data: gifsData, error: favoritesError, isLoading, mutate } = useSWR<{ data: Gif[] }>(urlWithParams, gifFetcher);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

    const gifs = useMemo(() => {
        if (!gifsData) return [];
        const favoritesIds = new Set(favoriteGifs.map(fav => fav.gifId));
        return gifsData.data.filter(gif => favoritesIds.has(gif.id));
    }, [gifsData, favoriteGifs]);

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

    const handleFavorite = (gifId: string) => {
        if (!paginatedData || !gifsData) return;
        mutate(async () => {
            await deleteFavoriteGif(gifId);
            return {
                ...gifsData,
                data: gifsData.data.filter(gif => gif.id !== gifId),
            };
        }, {
            optimisticData: {
                ...gifsData,
                data: gifsData.data.filter(gif => gif.id !== gifId),
            },
            populateCache: true,
            revalidate: false,
            rollbackOnError: true,
        });
    }

    return (
        <div className="h-80">
            {
                (isLoading || isLoadingFavorites) && gifs.length === 0 ?
                <Loading />
                :
                gifs.length > 0 ?
                <MasonryGrid 
                    data={gifs}
                    context={{ handleFavorite }}
                    itemContent={({ data: item, context: { handleFavorite } }) => {
                        if (!item) return null;
                        return <Gif onClick={() => handleGifClick(item.id)} isFavorite handleFavorite={() => handleFavorite(item.id)} key={item.id} width={item.images.fixed_width.width} height={item.images.fixed_width.height} url={item.images.fixed_width.url} alt={item.alt_text} />
                    }}
                    columnCount={2}
                    onEndReached={loadMore}
                />
                :
                <div className="flex items-center justify-center h-full">
                    <p className="text-center text-muted text-sm font-semibold select-none">
                        {(error || favoritesError) ? "Somehting went wrong" : "No GIFs or stickers found"}
                    </p>
                </div>
            }
        </div>
    );
}

export default FavoriteGifsGrid;