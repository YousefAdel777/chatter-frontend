import { ItemContent, VirtuosoMasonry } from '@virtuoso.dev/masonry'

type Props<T> = {
    data: T[];
    columnCount: number;
    onEndReached?: () => void;
    itemContent: ItemContent<T>;
    context?: unknown;
}

const MasonryGrid = <T,>({ data, columnCount, context, onEndReached, itemContent }: Props<T>) => {

    return (
        <VirtuosoMasonry
            data={data}
            style={{ height: "100%" }}
            onScrollCapture={(e) => {
                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                if (scrollHeight - scrollTop <= clientHeight + 100 && onEndReached) {
                    onEndReached();
                }
            }}
            context={context}
            columnCount={columnCount}
            ItemContent={itemContent}
        />
    );
}

export default MasonryGrid;