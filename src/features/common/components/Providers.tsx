import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import fetcher from "../lib/fetcher";
import { ThemeProvider } from "next-themes";
import SyncFusionProvider from "./SyncFusionProvider";

type Props = {
    children: React.ReactNode;
}

const Providers: React.FC<Props> = ({ children }) => {
    return (
        <SWRConfig value={{ fetcher }}>
            <SessionProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <SyncFusionProvider>
                        {children}
                    </SyncFusionProvider>
                </ThemeProvider>
            </SessionProvider>
        </SWRConfig>
    );
}

export default Providers;