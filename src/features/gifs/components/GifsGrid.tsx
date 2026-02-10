import useSWR from "swr";
import Gif from "./Gif";
import useGifPagintation from "../hooks/useGifPagination";
import { useCallback, useEffect, useMemo, useRef } from "react";
import Loading from "@/features/common/components/Loading";
import MasonryGrid from "@/features/common/components/MasonryGrid";
import { createFavoriteGifMutation, createFavoriteGifOptions, deleteFavoriteGifMutation, deleteFavoriteGifOptions } from "../mutations";
import { useSession } from "next-auth/react";

type Props = {
    search: string;
    url: string;
    searchUrl: string;
    handleGifClick: (gifId: string) => void;
}

const PAGE_SIZE = 20;

const GifsGrid: React.FC<Props> = ({ search, url, searchUrl, handleGifClick }) => {
    
    const { data: session } = useSession();
    const { paginatedData, setSize, hasMore, isLoading, error } = useGifPagintation<Gif>(search.length > 0 ? searchUrl : url, PAGE_SIZE, search);
    const gifIds = useMemo(() => paginatedData.map(gif => gif.id).join(","), [paginatedData]);
    const { data: favoriteGifs, error: favoritesError, mutate } = useSWR<FavoriteGif[]>(`/api/favorite-gifs/batch?gifIds=${gifIds}`);
    const favoritesIds = useMemo(() => {
        if (!favoriteGifs) return new Set();
        return new Set(favoriteGifs.map(fav => fav.gifId));
    }, [favoriteGifs]);
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

    const handleFavorite = (gifId: string) => {
        if (!favoriteGifs || !session?.user) return;
        const isFavorite = favoriteGifs.some(fav => fav.gifId === gifId);
        if (isFavorite) {
            mutate(deleteFavoriteGifMutation(gifId, favoriteGifs), deleteFavoriteGifOptions(gifId, favoriteGifs));
        }
        else {
            mutate(createFavoriteGifMutation(gifId, favoriteGifs), createFavoriteGifOptions(session.user.id, gifId, favoriteGifs));
        }
    }

    return (
        <div className="h-80">
            {
                isLoading && (!paginatedData || paginatedData.length === 0) ?
                <Loading />
                :
                (paginatedData && paginatedData.length > 0) ?
                <MasonryGrid 
                    context={{ favoritesIds, handleFavorite }}
                    data={paginatedData}
                    itemContent={({ data: item, context: { favoritesIds, handleFavorite } }) => {
                        if (!item) return null;
                        const gif = item.images.fixed_width;
                        return <Gif onClick={() => handleGifClick(item.id)} isFavorite={favoritesIds.has(item.id)} handleFavorite={() => handleFavorite(item.id)} key={item.id} width={gif?.width} height={gif?.height} url={gif?.url} alt={item.alt_text} />
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
    )
}

export default GifsGrid;