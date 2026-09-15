// WHY: Shared heading component keeps titles, subtitles, and page actions consistent
export function PageHeading({ title, description, actions = [] })
{
  let actionNav = null;
  if (actions.length > 0)
  {
    // DECISION: Page actions stay grouped in header
    actionNav = (
      <nav className="page-heading-actions" aria-label={`${title} actions`}>
        {actions.map((action) => <a className="btn btn-outline-info" href={action.href} key={`${action.href}-${action.label}`}>{action.label}</a>)}
      </nav>
    );
  }
  let descriptionContent = null;
  if (description)
    // FALLBACK: Empty descriptions render nothing
    descriptionContent = <p>{description}</p>;

  return (
    <header className="page-heading">
      <div>
        <h1 id="page-title">{title}</h1>
      </div>
      {descriptionContent}
      {actionNav}
    </header>
  );
}
