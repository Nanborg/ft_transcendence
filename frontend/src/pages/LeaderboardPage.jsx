import { PageHeading } from '../components/PageHeading';

export function LeaderboardPage({ title, description }) {
    return (
        <div className="leaderboard-panel">
            <PageHeading title={title} description={description} />
        </div>
    );
}