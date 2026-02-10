/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, test, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import GifCategoriesGrid from "../components/GifCategoriesGrid";

vi.mock("../hooks/useGifPagination", () => ({
    default: vi.fn()
}));

vi.mock("@/features/common/components/Loading", () => ({
    default: () => <div data-testid="loading-spinner">Loading...</div>
}));

vi.mock("@/features/common/components/MasonryGrid", () => ({
    default: ({ data, itemContent, onEndReached }: any) => (
        <div data-testid="masonry-grid">
            {data.map((item: any) => itemContent({ data: item }))}
            <button onClick={onEndReached}>Load More</button>
        </div>
    )
}));

vi.mock("../components/GifCategory", () => ({
    default: ({ gifCatgeory, onClick }: any) => (
        <div data-testid={`category-${gifCatgeory.name}`} onClick={onClick}>
            {gifCatgeory.name}
        </div>
    )
}));

import useGifPagination from "../hooks/useGifPagination";

describe("GifCategoriesGrid", () => {
    const mockHandleCategoryClick = vi.fn();
    const mockSetSize = vi.fn();

    const mockCategories = [
        { name: "Actions", gif: { images: { fixed_width_downsampled: { url: "" } } } },
        { name: "Animals", gif: { images: { fixed_width_downsampled: { url: "" } } } }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    test("renders loading state initially when no data is present", () => {
        (useGifPagination as any).mockReturnValue({
            paginatedData: null,
            setSize: mockSetSize,
            hasMore: true,
            isLoading: true,
            error: null
        });

        render(<GifCategoriesGrid handleCategoryClick={mockHandleCategoryClick} />);
        expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    test("renders list of categories when data is loaded", () => {
        (useGifPagination as any).mockReturnValue({
            paginatedData: mockCategories,
            setSize: mockSetSize,
            hasMore: true,
            isLoading: false,
            error: null
        });

        render(<GifCategoriesGrid handleCategoryClick={mockHandleCategoryClick} />);
        
        expect(screen.getByTestId("category-Actions")).toBeInTheDocument();
        expect(screen.getByTestId("category-Animals")).toBeInTheDocument();
    });

    test("calls handleCategoryClick when a category is clicked", () => {
        (useGifPagination as any).mockReturnValue({
            paginatedData: mockCategories,
            setSize: mockSetSize,
            hasMore: true,
            isLoading: false,
            error: null
        });

        render(<GifCategoriesGrid handleCategoryClick={mockHandleCategoryClick} />);
        
        fireEvent.click(screen.getByTestId("category-Actions"));
        expect(mockHandleCategoryClick).toHaveBeenCalledWith("Actions");
    });

    test("triggers loadMore and calls setSize after delay", () => {
        (useGifPagination as any).mockReturnValue({
            paginatedData: mockCategories,
            setSize: mockSetSize,
            hasMore: true,
            isLoading: false,
            error: null
        });

        render(<GifCategoriesGrid handleCategoryClick={mockHandleCategoryClick} />);
        
        const loadMoreButton = screen.getByText("Load More");
        fireEvent.click(loadMoreButton);

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(mockSetSize).toHaveBeenCalled();
    });

    test("shows error message when pagination fails", () => {
        (useGifPagination as any).mockReturnValue({
            paginatedData: [],
            setSize: mockSetSize,
            hasMore: false,
            isLoading: false,
            error: new Error("Fetch failed")
        });

        render(<GifCategoriesGrid handleCategoryClick={mockHandleCategoryClick} />);
        
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    test("shows empty state when no categories are returned", () => {
        (useGifPagination as any).mockReturnValue({
            paginatedData: [],
            setSize: mockSetSize,
            hasMore: false,
            isLoading: false,
            error: null
        });

        render(<GifCategoriesGrid handleCategoryClick={mockHandleCategoryClick} />);
        
        expect(screen.getByText("No categories found")).toBeInTheDocument();
    });
});