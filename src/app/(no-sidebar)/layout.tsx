import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Providers from "@/features/common/components/Providers";

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Chatter",
    description: "Chatter",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistMono.variable}`}
            >
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
