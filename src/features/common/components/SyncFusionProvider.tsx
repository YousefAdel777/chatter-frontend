"use client";

import { useEffect } from "react";
import { registerLicense } from "@syncfusion/ej2-base";

type Props = {
    children: React.ReactNode;
}

const SyncFusionProvider: React.FC<Props> = ({ children }) => {

    useEffect(() => {
        registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_KEY!);
    }, []);
    
    return (
        <>{children}</>
    );
}

export default SyncFusionProvider;