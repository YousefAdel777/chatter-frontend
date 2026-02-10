/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, test, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import GifsGrid from "../components/GifsGrid";

vi.mock("next-auth/react", () => ({
    useSession: vi.fn()
}));

vi.mock("swr", () => ({
    default: vi.fn()
}));

vi.mock("../hooks/useGifPagination", () => ({
    default: vi.fn()
}));

vi.mock("../mutations", () => ({
    createFavoriteGifMutation: vi.fn(),
    createFavoriteGifOptions: vi.fn(),
    deleteFavoriteGifMutation: vi.fn(),
    deleteFavoriteGifOptions: vi.fn(),
}));

vi.mock("@/features/common/components/Loading", () => ({
    default: () => <div data-testid="loading-spinner" />
}));

vi.mock("@/features/common/components/MasonryGrid", () => ({
    default: ({ data, itemContent, context, onEndReached }: any) => (
        <div data-testid="masonry-grid">
            {data.map((item: any) => itemContent({ data: item, context }))}
            <button onClick={onEndReached}>Load More</button>
        </div>
    )
}));

vi.mock("../components/Gif", () => ({
    default: ({ onClick, handleFavorite, isFavorite, alt }: any) => (
        <div data-testid={`gif-${alt}`}>
            <span data-testid="favorite-status">{isFavorite ? "fav" : "not-fav"}</span>
            <button onClick={onClick}>View</button>
            <button onClick={handleFavorite}>Toggle Favorite</button>
        </div>
    )
}));

import { useSession } from "next-auth/react";
import useSWR from "swr";
import useGifPagintation from "../hooks/useGifPagination";

describe("GifsGrid", () => {
    const mockHandleGifClick = vi.fn();
    const mockMutate = vi.fn();

    const mockGifs = [
        { id: "1", alt_text: "Gif1", images: { fixed_width: { url: "u1", width: "10", height: "10" } } },
        { id: "2", alt_text: "Gif2", images: { fixed_width: { url: "u2", width: "10", height: "10" } } }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        
        (useSession as any).mockReturnValue({ data: { user: { id: "user1" } } });
        (useSWR as any).mockReturnValue({ data: [{ gifId: "1" }], mutate: mockMutate });
        (useGifPagintation as any).mockReturnValue({
            paginatedData: mockGifs,
            setSize: vi.fn(),
            hasMore: true,
            isLoading: false,
            error: null
        });
    });

    test("renders loading state", () => {
        (useGifPagintation as any).mockReturnValue({
            paginatedData: [],
            isLoading: true
        });
        render(<GifsGrid search="" url="" searchUrl="" handleGifClick={mockHandleGifClick} />);
        expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    test("renders gifs and identifies favorites", () => {
        render(<GifsGrid search="" url="trending" searchUrl="search" handleGifClick={mockHandleGifClick} />);
        
        const gifs = screen.getAllByTestId("favorite-status");
        expect(gifs[0].textContent).toBe("fav");
        expect(gifs[1].textContent).toBe("not-fav");
    });

    test("calls handleGifClick", () => {
        render(<GifsGrid search="" url="trending" searchUrl="search" handleGifClick={mockHandleGifClick} />);
        fireEvent.click(screen.getAllByText("View")[0]);
        expect(mockHandleGifClick).toHaveBeenCalledWith("1");
    });

    test("triggers delete mutation for existing favorite", () => {
        render(<GifsGrid search="" url="trending" searchUrl="search" handleGifClick={mockHandleGifClick} />);
        fireEvent.click(screen.getAllByText("Toggle Favorite")[0]);
        expect(mockMutate).toHaveBeenCalled();
    });

    test("triggers create mutation for non-favorite", () => {
        render(<GifsGrid search="" url="trending" searchUrl="search" handleGifClick={mockHandleGifClick} />);
        fireEvent.click(screen.getAllByText("Toggle Favorite")[1]);
        expect(mockMutate).toHaveBeenCalled();
    });

    test("pagination setSize called after delay", () => {
        const setSize = vi.fn();
        (useGifPagintation as any).mockReturnValue({
            paginatedData: mockGifs,
            setSize,
            hasMore: true,
            isLoading: false
        });

        render(<GifsGrid search="" url="trending" searchUrl="search" handleGifClick={mockHandleGifClick} />);
        fireEvent.click(screen.getByText("Load More"));
        
        act(() => {
            vi.advanceTimersByTime(500);
        });
        
        expect(setSize).toHaveBeenCalled();
    });

    test("renders error message", () => {
        (useGifPagintation as any).mockReturnValue({
            paginatedData: [],
            error: true
        });
        render(<GifsGrid search="" url="" searchUrl="" handleGifClick={mockHandleGifClick} />);
        expect(screen.getByText("Somehting went wrong")).toBeInTheDocument();
    });
});