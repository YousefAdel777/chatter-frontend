import { useEffect, useState } from "react";

const useDebounce = <T>(value: T, delay: number = 500): { debouncedValue: T } => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timeout);
    }, [delay, value]);

    return { debouncedValue };
}

export default useDebounce;