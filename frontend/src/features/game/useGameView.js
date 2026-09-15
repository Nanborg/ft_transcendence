import { useMemo, useSyncExternalStore } from "react";

export function useGameView(gameStore, playerId)
{
    const getSnashot = useMemo(() => gameStore.createPlayerView(playerId), [gameStore, playerId]);
    return useSyncExternalStore(
        gameStore.subscribe,
        getSnashot,
        getSnashot
    );
}
