import { vi, describe, test, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GifPicker from "../components/GifPicker";

vi.mock("../components/FavoriteGifsGrid", () => ({
    default: ({ url }: { url: string }) => <div data-testid="favorites-grid" data-url={url} />
}));

vi.mock("../components/GifsGrid", () => ({
    default: ({ search, url }: { search: string, url: string }) => (
        <div data-testid="gifs-grid" data-search={search} data-url={url} />
    )
}));

vi.mock("../components/GifCategoriesGrid", () => ({
    default: ({ handleCategoryClick }: { handleCategoryClick: (name: string) => void }) => (
        <div data-testid="categories-grid">
            <button onClick={() => handleCategoryClick("Stickers")}>Click Sticker Category</button>
            <button onClick={() => handleCategoryClick("Funny")}>Click Funny Category</button>
        </div>
    )
}));

vi.mock("../components/GifPickerTab", () => ({
    default: ({ children, onClick, isActive }: { children: React.ReactNode, onClick: () => void, isActive: boolean }) => (
        <button onClick={onClick} data-active={isActive}>{children}</button>
    )
}));

vi.mock("@/features/search/hooks/useDebounce", () => ({
    default: (val: string) => ({ debouncedValue: val }),
}));

describe("GifPicker", () => {
    const mockHandleGifClick = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("renders GIFs tab as initial state", () => {
        render(<GifPicker handleGifClick={mockHandleGifClick} />);
        
        expect(screen.getByTestId("gifs-grid")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Search Giphy...")).toBeInTheDocument();
    });

    test("navigates between all tabs", () => {
        render(<GifPicker handleGifClick={mockHandleGifClick} />);

        fireEvent.click(screen.getByText("Favorites"));
        expect(screen.getByTestId("favorites-grid")).toBeInTheDocument();
        expect(screen.queryByPlaceholderText("Search Giphy...")).not.toBeInTheDocument();

        fireEvent.click(screen.getByText("Stickers"));
        expect(screen.getByTestId("gifs-grid")).toHaveAttribute("data-url", "https://api.giphy.com/v1/stickers/trending");
        expect(screen.getByPlaceholderText("Search Giphy...")).toBeInTheDocument();

        fireEvent.click(screen.getByText("Categories"));
        expect(screen.getByTestId("categories-grid")).toBeInTheDocument();
    });

    test("updates search input and passes value to grid", () => {
        render(<GifPicker handleGifClick={mockHandleGifClick} />);
        
        const input = screen.getByPlaceholderText("Search Giphy...") as HTMLInputElement;
        fireEvent.change(input, { target: { value: "dance" } });
        
        expect(input.value).toBe("dance");
        expect(screen.getByTestId("gifs-grid")).toHaveAttribute("data-search", "dance");
    });

    test("switches to stickers tab via category click", () => {
        render(<GifPicker handleGifClick={mockHandleGifClick} />);
        
        fireEvent.click(screen.getByText("Categories"));
        fireEvent.click(screen.getByText("Click Sticker Category"));

        expect(screen.getByTestId("gifs-grid")).toHaveAttribute("data-url", "https://api.giphy.com/v1/stickers/trending");
    });

    test("switches to gifs tab and sets search via category click", () => {
        render(<GifPicker handleGifClick={mockHandleGifClick} />);
        
        fireEvent.click(screen.getByText("Categories"));
        fireEvent.click(screen.getByText("Click Funny Category"));

        expect(screen.getByTestId("gifs-grid")).toBeInTheDocument();
        const input = screen.getByPlaceholderText("Search Giphy...") as HTMLInputElement;
        expect(input.value).toBe("Funny");
    });

    test("maintains search state when switching back from favorites", () => {
        render(<GifPicker handleGifClick={mockHandleGifClick} />);
        
        const input = screen.getByPlaceholderText("Search Giphy...");
        fireEvent.change(input, { target: { value: "hello" } });
        
        fireEvent.click(screen.getByText("Favorites"));
        fireEvent.click(screen.getByText("GIFs"));
        
        expect((screen.getByPlaceholderText("Search Giphy...") as HTMLInputElement).value).toBe("hello");
    });
});