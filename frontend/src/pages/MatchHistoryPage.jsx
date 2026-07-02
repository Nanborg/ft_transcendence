import { PageHeading } from "../components/PageHeading";

export function MatchHistoryPage({ title, description}) {
    return (
        <div className="match-history-panel">
            <PageHeading title={title} description={description} />
        </div>
    );
}