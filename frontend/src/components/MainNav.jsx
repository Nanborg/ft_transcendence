export function MainNav({ pages, currentPageId }) {
  return (
    <nav className="main-nav" aria-label="Main navigation">
      {pages.map((page) => (
        <a
          key={page.id}
          href={`#${page.path}`}
          aria-current={currentPageId === page.id ? 'page' : undefined}
        >
          {page.label}
        </a>
      ))}
    </nav>
  );
}