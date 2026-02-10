/* eslint-disable @next/next/no-img-element */

type Props = {
    gifCatgeory: GifCategory;
    onClick?: () => void;
}

const GifCategory: React.FC<Props> = ({ gifCatgeory, onClick }) => {
    return (
        <div className="relative p-1 cursor-pointer" onClick={onClick}>
            <img className="rounded-md" height={gifCatgeory.gif.images.fixed_width_downsampled?.height} width={gifCatgeory.gif.images.fixed_width_downsampled?.width} src={gifCatgeory.gif.images.fixed_width_downsampled?.url} alt={gifCatgeory.gif.alt_text} />
            <div className="absolute rounded-md flex items-center justify-center w-[calc(100%_-_0.5rem)] h-[calc(100%_-_0.5rem)] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base text-lg font-bold bg-primary/15">
                {gifCatgeory.name}
            </div>
        </div>
    );
}

export default GifCategory;