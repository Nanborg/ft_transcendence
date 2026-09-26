import { useLayoutEffect, useRef } from 'react';

export function useChatAutoScroll(messages, viewKey)
{
    const listRef = useRef(null);

    useLayoutEffect(() => {
        const list = listRef.current;
        if (!list)
            return;

        const scrollToLatest = () => {
            list.scrollTop = list.scrollHeight;
        };
        scrollToLatest();

        if (typeof ResizeObserver === 'undefined')
            return;
        const observer = new ResizeObserver(scrollToLatest);
        observer.observe(list);
        return () => observer.disconnect();
    }, [messages, viewKey]);

    return listRef;
}
