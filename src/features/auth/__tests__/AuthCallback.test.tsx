/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, test, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthCallback from "../components/AuthCallback";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock("next-auth/react", () => ({
    signIn: vi.fn(),
}));

vi.mock("@/features/common/components/Loading", () => ({
    default: () => <div data-testid="loading-spinner" />,
}));

import { signIn } from "next-auth/react";

describe("AuthCallback", () => {
    const defaultProps = {
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("renders loading state initially and triggers signIn", async () => {
        (signIn as any).mockResolvedValue({ error: null });

        render(<AuthCallback {...defaultProps} />);

        expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
        expect(screen.getByText("Signing in...")).toBeInTheDocument();

        expect(signIn).toHaveBeenCalledWith("oauth", {
            accessToken: "test-access-token",
            refreshToken: "test-refresh-token",
            redirect: false,
        });
    });

    test("redirects to home on successful sign in", async () => {
        (signIn as any).mockResolvedValue({ error: null });

        render(<AuthCallback {...defaultProps} />);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/");
        });
    });

    test("shows error message if sign in fails", async () => {
        (signIn as any).mockResolvedValue({ error: "CredentialsSignin" });

        render(<AuthCallback {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByText("Failed to sign in")).toBeInTheDocument();
        });
        
        expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    test("navigates back to sign in page when return button is clicked on error", async () => {
        (signIn as any).mockResolvedValue({ error: "Error" });

        render(<AuthCallback {...defaultProps} />);

        const returnButton = await screen.findByText("Return to sign in");
        fireEvent.click(returnButton);

        expect(mockPush).toHaveBeenCalledWith("/auth/signin");
    });

    test("does not trigger signIn if tokens are missing", () => {
        render(<AuthCallback accessToken="" refreshToken="" />);
        
        expect(signIn).not.toHaveBeenCalled();
        expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
});