export function MainNav({ pages, currentPageId, onNavigate })
{
	// WHY: Navigation is generated from route table.
	return (
		<nav className="main-nav nav" aria-label="Main navigation">
			{pages.map((page) =>
			{
				let ariaCurrent = undefined;
				if (currentPageId === page.id)
					// REQUIRED: Accessibility marks current page.
					ariaCurrent = 'page';
				return (<a key={page.id} className="nav-link" href={`#${page.path}`} aria-current={ariaCurrent} onClick={onNavigate}>{page.label}</a>);
			})}
		</nav>
	);
}
