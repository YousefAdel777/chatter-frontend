import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, expect, describe, test } from "vitest";
import GifPickerTab from "../components/GifPickerTab";

describe("GifPickerTab", () => {
    test("renders children correctly", () => {
        render(<GifPickerTab>Trending</GifPickerTab>);
        expect(screen.getByRole("button", { name: /trending/i })).toBeInTheDocument();
    });

    test("applies active styles when isActive is true", () => {
        render(<GifPickerTab isActive>Trending</GifPickerTab>);
        const button = screen.getByRole("button");
        expect(button).toHaveClass("text-white", "bg-primary");
    });

    test("does not apply active styles when isActive is false", () => {
        render(<GifPickerTab isActive={false}>Trending</GifPickerTab>);
        const button = screen.getByRole("button");
        expect(button).not.toHaveClass("text-white", "bg-primary");
    });

    test("merges custom className with default styles", () => {
        render(<GifPickerTab className="custom-class">Trending</GifPickerTab>);
        const button = screen.getByRole("button");
        expect(button).toHaveClass("custom-class", "text-base", "rounded-xl");
    });

    test("calls onClick handler when clicked", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        render(<GifPickerTab onClick={onClick}>Trending</GifPickerTab>);
        
        await user.click(screen.getByRole("button"));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    test("passes through native button props", () => {
        render(<GifPickerTab disabled title="tab-title">Trending</GifPickerTab>);
        const button = screen.getByRole("button");
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute("title", "tab-title");
    });
});