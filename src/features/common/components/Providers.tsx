import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import fetcher from "../lib/fetcher";
import { ThemeProvider } from "next-themes";
import SyncFusionProvider from "./SyncFusionProvider";
import StompContextProvider from "../contexts/StompContextProvider";

type Props = {
    children: React.ReactNode;
}

const Providers: React.FC<Props> = ({ children }) => {
    return (
        <SWRConfig value={{ fetcher }}>
            <SessionProvider>
                <StompContextProvider>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        <SyncFusionProvider>
                            {children}
                        </SyncFusionProvider>
                    </ThemeProvider>
                </StompContextProvider>
            </SessionProvider>
        </SWRConfig>
    );
}

export default Providers;