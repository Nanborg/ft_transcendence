export function MainNav({ pages, currentPageId }) {
  return (
    <nav className="main-nav nav" aria-label="Main navigation">
      {pages.map((page) => (
        <a
          key={page.id}
          className="nav-link"
          href={`#${page.path}`}
          aria-current={currentPageId === page.id ? 'page' : undefined}
        >
          {page.label}
        </a>
      ))}
    </nav>
  );
}
