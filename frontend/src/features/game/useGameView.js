import { useMemo, useSyncExternalStore } from "react";

export function useGameView(gameStore, playerId)
{
    const getSnapshot = useMemo(() => gameStore.createPlayerView(playerId), [gameStore, playerId]);
    return useSyncExternalStore(
        gameStore.subscribe,
        getSnapshot,
        getSnapshot
    );
}
