export function MainNav({ pages, currentPageId, onNavigate })
{
	return (
		<nav className="main-nav nav" aria-label="Main navigation">
			{pages.map((page) =>
			{
				let ariaCurrent = undefined;
				if (currentPageId === page.id)
					ariaCurrent = 'page';
				return (<a key={page.id} className="nav-link" href={`#${page.path}`} aria-current={ariaCurrent} onClick={onNavigate}>{page.label}</a>);
			})}
		</nav>
	);
}
