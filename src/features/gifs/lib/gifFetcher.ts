const GIPHY_KEY = process.env.NEXT_PUBLIC_GIPHY_KEY;

const gifFetcher = async (url: string) => {
    if (!GIPHY_KEY) return;
    const urlWithKey = new URL(url);
    urlWithKey.searchParams.append("api_key", GIPHY_KEY);
    try {
        const res = await fetch(urlWithKey.toString(), {
            headers: {
                "Content-Type": "application/json",
            }
        });
        return res.json();
    }
    catch(error) {
        console.log(error);
    }
};

export default gifFetcher;