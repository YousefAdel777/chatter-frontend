import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, expect, describe, test } from "vitest";
import Gif from "../components/Gif";

describe("Gif component", () => {
    const defaultProps = {
        url: "https://example.com/test.gif",
        alt: "Test Gif",
        width: 400,
        height: 200,
        isFavorite: false,
        onClick: vi.fn(),
        handleFavorite: vi.fn(),
    };

    test("renders image with correct props", () => {
        render(<Gif {...defaultProps} />);
        const img = screen.getByRole("img");
        
        expect(img).toHaveAttribute("src", defaultProps.url);
        expect(img).toHaveAttribute("alt", defaultProps.alt);
        expect(img).toHaveAttribute("width", "400");
        expect(img).toHaveAttribute("height", "200");
    });

    test("manages loading state correctly", () => {
        const { container } = render(<Gif {...defaultProps} />);
        
        const skeleton = container.querySelector(".animate-pulse");
        const img = screen.getByRole("img");

        expect(skeleton).toBeInTheDocument();
        expect(img).toHaveClass("opacity-0");

        fireEvent.load(img);

        expect(container.querySelector(".animate-pulse")).not.toBeInTheDocument();
        expect(img).toHaveClass("opacity-100");
    });

    test("executes onClick when container is clicked", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        const { container } = render(<Gif {...defaultProps} onClick={onClick} />);
        
        await user.click(container.firstChild as HTMLElement);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    test("executes handleFavorite and stops propagation", async () => {
        const user = userEvent.setup();
        const handleFavorite = vi.fn();
        const onClick = vi.fn();
        
        render(<Gif {...defaultProps} handleFavorite={handleFavorite} onClick={onClick} />);
        
        const button = screen.getByRole("button");
        await user.click(button);
        
        expect(handleFavorite).toHaveBeenCalledTimes(1);
        expect(onClick).not.toHaveBeenCalled();
    });

    test("calculates aspect ratio correctly", () => {
        const { container } = render(<Gif {...defaultProps} width={800} height={200} />);
        const skeleton = container.querySelector(".animate-pulse") as HTMLElement;
        
        expect(skeleton.style.aspectRatio).toBe("4");
    });

    test("renders favorite button with correct visibility classes", () => {
        render(<Gif {...defaultProps} />);
        const button = screen.getByRole("button");
        expect(button).toHaveClass("hidden", "group-hover:flex");
    });
});