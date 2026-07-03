export function PlaceholderPage({ title, description }) {
  return (
    <>
      {/* Nanborg */}
      {/* TODO -> replace this placeholder for leaderboard and match history with real score views. */}
      {/* Those views should call the scores API instead of using static page descriptions. */}
      <p className="page-kicker">Frontend page</p>
      <h1 id="page-title">{title}</h1>
      <p>{description}</p>
    </>
  );
}