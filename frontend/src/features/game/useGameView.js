import { useMemo, useSyncExternalStore } from "react";

export function useGameView(gameStore, playerId)
{
    // SYNC: React reads the external game store through a stable snapshot
    const getSnapshot = useMemo(() => gameStore.createPlayerView(playerId), [gameStore, playerId]);
    return useSyncExternalStore(
        gameStore.subscribe,
        getSnapshot,
        getSnapshot
    );
}
