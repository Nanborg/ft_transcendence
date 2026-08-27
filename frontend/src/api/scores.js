
export async function fetchMatchHistory() {
    const response = await fetch('/api/scores/history', {
        credentials: 'include',
    });
    if (!response.ok) {
        const error = new Error('Unable to load match history');
        error.status = response.status;
        throw error;
    }
    return response.json();
}

export async function fetchLeaderBoard() {
    const response = await fetch('/api/scores/leaderboard');
    if (!response.ok) {
        const error = new Error('Unable to load leaderboard');
        error.status = response.status;
        throw error;
    }
    return response.json();
}
