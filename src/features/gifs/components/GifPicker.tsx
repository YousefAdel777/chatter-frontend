import { useState } from "react";
import useDebounce from "@/features/search/hooks/useDebounce";
import GifPickerTab from "./GifPickerTab";
import GifCategoriesGrid from "./GifCategoriesGrid";
import GifsGrid from "./GifsGrid";
import FavoriteGifsGrid from "./FavoriteGifsGrid";

const tabs = [
    {
        id: "favorites",
        name: "Favorites",
        url: "https://api.giphy.com/v1/gifs",
        searchUrl: "https://api.giphy.com/v1/gifs/search",
    },
    {
        id: "gifs",
        name: "GIFs",
        url: "https://api.giphy.com/v1/gifs/trending",
        searchUrl: "https://api.giphy.com/v1/gifs/search",
    },
    {
        id: "stickers",
        name: "Stickers",
        url: "https://api.giphy.com/v1/stickers/trending",
        searchUrl: "https://api.giphy.com/v1/stickers/search",
    },
    {
        id: "categories",
        name: "Categories",
        url: "https://api.giphy.com/v1/gifs/categories",
        searchUrl: ""
    },
];

type Props = {
    handleGifClick: (gifId: string) => void;
}

const GifPicker: React.FC<Props> = ({ handleGifClick }) => {

    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState(tabs[1]);
    const { debouncedValue } = useDebounce(search);

    const handleCategoryClick = (name: string) => {
        const targetId = (name === "Stickers") ? "stickers" : "gifs";
        const tab = tabs.find(tab => tab.id === targetId);
        if (!tab) return;
        setActiveTab(tab)
        if (targetId !== "stickers") {
            setSearch(name);
        }
    }

    return (
        <div className="bg-background rounded-lg  shadow-md">
            <div className="px-3 py-4">
                <div  className="mb-4 flex items-center gap-4">
                    {
                        tabs.map(tab => (
                            <GifPickerTab onClick={() => setActiveTab(tab)} isActive={tab.id === activeTab.id} key={tab.id}>
                                {tab.name}
                            </GifPickerTab>
                        ))
                    }
                </div>
                {
                    activeTab.id !== "categories" && activeTab.id !== "favorites" &&
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="form-input m-0"
                        placeholder="Search Giphy..."
                    />
                }
            </div>
            {
                activeTab.id === "categories" ?
                <GifCategoriesGrid  handleCategoryClick={handleCategoryClick} />
                :
                activeTab.id === "favorites" ?
                <FavoriteGifsGrid url={activeTab.url} handleGifClick={handleGifClick} />
                :
                <GifsGrid search={debouncedValue} url={activeTab.url} searchUrl={activeTab.searchUrl} handleGifClick={handleGifClick} />
            }
        </div>
    );
}

export default GifPicker;