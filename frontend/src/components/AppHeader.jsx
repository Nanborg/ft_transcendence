import { MainNav } from './MainNav';

export function AppHeader({ pages, currentPageId }) {
  return (
    <header className="app-header navbar navbar-expand-lg">
      <a className="brand" href="#/">
        ft_transcendence
      </a>

      <MainNav pages={pages} currentPageId={currentPageId} />
    </header>
  );
}
