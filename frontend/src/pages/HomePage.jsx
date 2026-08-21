import { AppHeader } from '../components/AppHeader';

export function HomePage({ title, description, pages, currentPageId })
{
  return (
    <section className="home-game-window">
      <AppHeader pages={pages} currentPageId={currentPageId} />
      <div className="home-game-scene" aria-hidden="true">
        <div className="home-arena-grid" />
      </div>
      <div className="home-game-title">
        <p className="page-kicker">System online</p>
        <h1 id="page-title">{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
