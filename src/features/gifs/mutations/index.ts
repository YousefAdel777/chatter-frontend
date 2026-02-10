import { createFavoriteGif, deleteFavoriteGif } from "../actions";

export const deleteFavoriteGifOptions = (gifId: string, favoriteGifs: FavoriteGif[]) => {
    return {
        optimisticData: favoriteGifs.filter(fav => fav.gifId !== gifId),
        rollbackOnError: true,
        revalidate: false,
        populateCache: true
    }
}

export const deleteFavoriteGifMutation = async (gifId: string, favoriteGifs: FavoriteGif[]) => {
    await deleteFavoriteGif(gifId);
    return favoriteGifs.filter(fav => fav.gifId !== gifId);
}

export const createFavoriteGifOptions = (userId: number, gifId: string, favoriteGifs: FavoriteGif[]) => {
    return {
        optimisticData: [...favoriteGifs, {
            id: Date.now(),
            userId,
            gifId,
            createdAt: new Date(),
        }],
        rollbackOnError: true,
        revalidate: false,
        populateCache: true
    }
}

export const createFavoriteGifMutation = async (gifId: string, favoriteGifs: FavoriteGif[]) => {
    const res = await createFavoriteGif({gifId});
    return [...favoriteGifs, res];
}