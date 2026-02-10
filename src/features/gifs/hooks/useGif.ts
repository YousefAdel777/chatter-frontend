import useSWR from "swr";
import gifFetcher from "../lib/gifFetcher";

const useGif = (gifId: string) => {
    const { error, isLoading, data: gifData } = useSWR<{ data: Gif }>(`https://api.giphy.com/v1/gifs/${gifId}`, gifFetcher);
    return {
        gif: gifData?.data,
        isLoading,
        error
    };
}

export default useGif;