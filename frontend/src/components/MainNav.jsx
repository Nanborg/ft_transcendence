export function MainNav({ pages, currentPageId, onNavigate }) {
  return (
    <nav className="main-nav nav" aria-label="Main navigation">
      {pages.map((page) => (
        <a
          key={page.id}
          className="nav-link"
          href={`#${page.path}`}
          aria-current={currentPageId === page.id ? 'page' : undefined}
          onClick={onNavigate}
        >
          {page.label}
        </a>
      ))}
    </nav>
  );
}
