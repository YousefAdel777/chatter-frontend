import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, expect, describe, test } from "vitest";
import GifCategory from "../components/GifCategory";

describe("GifCategory component", () => {
    const mockGifCategory: GifCategory = {
        name: "Reaction GIFs",
        is_sticker: 0,
        gif: {
            id: "abc-123",
            alt_text: "A reaction gif",
            images: {
                fixed_width_downsampled: {
                    url: "https://media.giphy.com/test_downsampled.gif",
                    width: 200,
                    height: 150,
                },
                fixed_width: {
                    url: "https://media.giphy.com/test.gif",
                    width: 200,
                    height: 200,
                }
            },
        },
    };

    test("renders the category name and the downsampled image", () => {
        render(<GifCategory gifCatgeory={mockGifCategory} />);

        expect(screen.getByText("Reaction GIFs")).toBeInTheDocument();
        
        const img = screen.getByRole("img");
        const downsampled = mockGifCategory.gif.images.fixed_width_downsampled;
        
        expect(img).toHaveAttribute("src", downsampled.url);
        expect(img).toHaveAttribute("alt", mockGifCategory.gif.alt_text);
        expect(img).toHaveAttribute("width", downsampled.width.toString());
        expect(img).toHaveAttribute("height", downsampled.height.toString());
    });

    test("triggers onClick callback when clicked", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        
        const { container } = render(
            <GifCategory gifCatgeory={mockGifCategory} onClick={onClick} />
        );

        const clickableDiv = container.firstChild as HTMLElement;
        await user.click(clickableDiv);
        
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    test("contains the expected overlay styling classes", () => {
        render(<GifCategory gifCatgeory={mockGifCategory} />);
        
        const overlay = screen.getByText("Reaction GIFs");
        
        expect(overlay).toHaveClass("absolute", "font-bold", "bg-primary/15");
        expect(overlay.parentElement).toHaveClass("relative", "cursor-pointer");
    });
});