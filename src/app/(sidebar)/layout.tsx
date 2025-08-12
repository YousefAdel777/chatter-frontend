import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Providers from "@/features/common/components/Providers";
import Sidebar from "@/features/common/components/Sidebar";
import fetcher from "@/features/common/lib/fetcher";
import CallModal from "@/features/calls/components/CallModal";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chatter",
  description: "Chatter",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [chats, stories, userStories, currentUser] = await Promise.all([
    fetcher("/api/chats"),
    fetcher("/api/stories"),
    fetcher("/api/stories/me"),
    fetcher("/api/users/me")
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistMono.variable}`}
      >
        <Providers>
          <div className="flex items-start">
            <Sidebar userStories={userStories} stories={stories} user={currentUser} chats={chats} />
            {children}
          </div>
          <CallModal currentUser={currentUser} />
        </Providers>
      </body>
    </html>
  );
}
