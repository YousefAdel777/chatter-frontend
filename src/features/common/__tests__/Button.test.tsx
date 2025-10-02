import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, expect, describe, test, beforeEach } from "vitest";
import Button from "../components/Button";
import { useFormStatus } from "react-dom";

vi.mock("react-dom", () => ({
    ...vi.importActual("react-dom"),
    useFormStatus: vi.fn(),
}));

const mockedUseFormStatus = useFormStatus;

describe("Button component", () => {
    beforeEach(() => {
        mockedUseFormStatus.mockReturnValue({ pending: false });
    });

    test("renders children correctly", () => {
        render(<Button>Click Me</Button>);
        expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
    });

    test("applies default styles", () => {
        render(<Button>Styled</Button>);
        const button = screen.getByRole("button", { name: /styled/i });
        expect(button).toHaveClass("bg-primary text-white");
    });

    test("merges custom className", () => {
        render(<Button className="custom-class">Custom</Button>);
        const button = screen.getByRole("button", { name: /custom/i });
        expect(button).toHaveClass("custom-class");
    });

    test("is disabled when isLoading is true", () => {
        render(<Button isLoading>Loading</Button>);
        expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();
    });

    test("is disabled when pending is true from useFormStatus", () => {
        mockedUseFormStatus.mockReturnValue({ pending: true });
        render(<Button>Pending</Button>);
        expect(screen.getByRole("button", { name: /pending/i })).toBeDisabled();
    });

    test("is enabled when not loading and not pending", () => {
        render(<Button>Active</Button>);
        expect(screen.getByRole("button", { name: /active/i })).toBeEnabled();
    });

    test("handles click event", async () => {
        const onClick = vi.fn();
        const user = userEvent.setup();
        render(<Button onClick={onClick}>Press</Button>);
        await user.click(screen.getByRole("button", { name: /press/i }));
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
