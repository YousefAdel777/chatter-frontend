/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, test, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import FavoriteGifsGrid from "../components/FavoriteGifsGrid";

vi.mock("../actions", () => ({
    deleteFavoriteGif: vi.fn(),
}));

vi.mock("@/features/common/hooks/usePagination", () => ({
    default: vi.fn()
}));

vi.mock("swr", () => ({
    default: vi.fn()
}));

vi.mock("@/features/common/components/Loading", () => ({
    default: () => <div data-testid="loading-spinner">Loading...</div>
}));

vi.mock("@/features/common/components/MasonryGrid", () => ({
    default: ({ data, itemContent, context, onEndReached }: any) => (
        <div data-testid="masonry-grid">
            {data.map((item: any) => 
                itemContent({ data: item, context })
            )}
            <button onClick={onEndReached}>Load More</button>
        </div>
    )
}));

vi.mock("../components/Gif", () => ({
    default: ({ onClick, handleFavorite, alt }: any) => (
        <div data-testid={`gif-${alt}`}>
            <button onClick={onClick}>View</button>
            <button onClick={handleFavorite}>Unfavorite</button>
        </div>
    )
}));

import usePagination from "@/features/common/hooks/usePagination";
import useSWR from "swr";
import { deleteFavoriteGif } from "../actions";

describe("FavoriteGifsGrid", () => {
    const mockHandleGifClick = vi.fn();
    const mockMutate = vi.fn();
    const baseUrl = "https://api.giphy.com/v1/gifs";

    const mockFavoriteGifs = [
        { gifId: "1", id: "fav1" },
        { gifId: "2", id: "fav2" }
    ];

    const mockGifsData = {
        data: [
            { id: "1", alt_text: "Gif One", images: { fixed_width: { url: "", width: "100", height: "100" } } },
            { id: "2", alt_text: "Gif Two", images: { fixed_width: { url: "", width: "100", height: "100" } } }
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    test("renders loading state when fetching favorites", () => {
        (usePagination as any).mockReturnValue({
            paginatedData: null,
            data: [],
            setSize: vi.fn(),
            hasMore: true,
            isLoadingFavorites: true,
            error: null
        });
        (useSWR as any).mockReturnValue({ data: null, isLoading: true });

        render(<FavoriteGifsGrid handleGifClick={mockHandleGifClick} url={baseUrl} />);
        expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    test("renders favorite gifs successfully", () => {
        (usePagination as any).mockReturnValue({
            paginatedData: [{}],
            data: mockFavoriteGifs,
            setSize: vi.fn(),
            hasMore: true,
            isLoadingFavorites: false,
            error: null
        });
        (useSWR as any).mockReturnValue({ data: mockGifsData, isLoading: false, mutate: mockMutate });

        render(<FavoriteGifsGrid handleGifClick={mockHandleGifClick} url={baseUrl} />);
        
        expect(screen.getByTestId("gif-Gif One")).toBeInTheDocument();
        expect(screen.getByTestId("gif-Gif Two")).toBeInTheDocument();
    });

    test("calls handleGifClick when gif view is clicked", () => {
        (usePagination as any).mockReturnValue({
            paginatedData: [{}],
            data: mockFavoriteGifs,
            setSize: vi.fn(),
            hasMore: true,
            isLoadingFavorites: false,
            error: null
        });
        (useSWR as any).mockReturnValue({ data: mockGifsData, isLoading: false, mutate: mockMutate });

        render(<FavoriteGifsGrid handleGifClick={mockHandleGifClick} url={baseUrl} />);
        
        fireEvent.click(screen.getAllByText("View")[0]);
        expect(mockHandleGifClick).toHaveBeenCalledWith("1");
    });

    test("triggers deleteFavoriteGif and optimistic update on unfavorite", async () => {
        (usePagination as any).mockReturnValue({
            paginatedData: [{}],
            data: mockFavoriteGifs,
            setSize: vi.fn(),
            hasMore: true,
            isLoadingFavorites: false,
            error: null
        });
        (useSWR as any).mockReturnValue({ data: mockGifsData, isLoading: false, mutate: mockMutate });

        render(<FavoriteGifsGrid handleGifClick={mockHandleGifClick} url={baseUrl} />);
        
        fireEvent.click(screen.getAllByText("Unfavorite")[0]);

        expect(mockMutate).toHaveBeenCalled();
        const mutateCall = mockMutate.mock.calls[0];
        
        // Execute the async function passed to mutate
        await mutateCall[0]();
        expect(deleteFavoriteGif).toHaveBeenCalledWith("1");
    });

    test("loadMore updates pagination size after delay", () => {
        const setSize = vi.fn();
        (usePagination as any).mockReturnValue({
            paginatedData: [{}],
            data: mockFavoriteGifs,
            setSize,
            hasMore: true,
            isLoadingFavorites: false,
            error: null
        });
        (useSWR as any).mockReturnValue({ data: mockGifsData, isLoading: false, mutate: mockMutate });

        render(<FavoriteGifsGrid handleGifClick={mockHandleGifClick} url={baseUrl} />);
        
        fireEvent.click(screen.getByText("Load More"));
        
        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(setSize).toHaveBeenCalled();
    });

    test("renders error message on failure", () => {
        (usePagination as any).mockReturnValue({
            paginatedData: [],
            data: [],
            setSize: vi.fn(),
            hasMore: false,
            isLoadingFavorites: false,
            error: new Error("Fail")
        });
        (useSWR as any).mockReturnValue({ data: null, isLoading: false, error: new Error("Fail") });

        render(<FavoriteGifsGrid handleGifClick={mockHandleGifClick} url={baseUrl} />);
        expect(screen.getByText("Somehting went wrong")).toBeInTheDocument();
    });

    test("renders empty state when no favorites exist", () => {
        (usePagination as any).mockReturnValue({
            paginatedData: [],
            data: [],
            setSize: vi.fn(),
            hasMore: false,
            isLoadingFavorites: false,
            error: null
        });
        (useSWR as any).mockReturnValue({ data: { data: [] }, isLoading: false });

        render(<FavoriteGifsGrid handleGifClick={mockHandleGifClick} url={baseUrl} />);
        expect(screen.getByText("No GIFs or stickers found")).toBeInTheDocument();
    });
});