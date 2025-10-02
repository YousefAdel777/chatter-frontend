"use client";

import { Client } from "@stomp/stompjs";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useRef } from "react";

const BASE_WS_URL = process.env.NEXT_PUBLIC_BASE_WS_URL;

type StompContextType = {
    getClient: () => Client | null;
};

type Props = {
    children: React.ReactNode;
}

const StompContext = createContext<StompContextType | null>(null);

export const useStompContext = () => {
    const context = useContext(StompContext);
    if (!context) {
        throw new Error("useStompContext must be used within a StompContextProvider");
    }
    return context;
};

const StompContextProvider: React.FC<Props> = ({ children }) => {
    const { data: session } = useSession();
    const stompClientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!session?.user?.accessToken) return;
        const client = new Client({
            brokerURL: BASE_WS_URL,
            connectHeaders: {
                "Authorization": `Bearer ${session.user.accessToken}`,
            },
            reconnectDelay: 100,
        });

        stompClientRef.current = client;
        client.activate();

        return () => {
            stompClientRef.current = null;
            client.deactivate();
        };
    }, [session?.user?.accessToken]);

    const contextValue = {
        getClient: () => stompClientRef.current,
    };

    return (
        <StompContext.Provider value={contextValue}>
            {children}
        </StompContext.Provider>
    );
};

export default StompContextProvider;