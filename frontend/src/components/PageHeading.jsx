export function PageHeading({ title, description, actions = [] })
{
  let actionNav = null;
  if (actions.length > 0)
  {
    actionNav = (
      <nav className="page-heading-actions" aria-label={`${title} actions`}>
        {actions.map((action) => <a className="btn btn-outline-info" href={action.href} key={`${action.href}-${action.label}`}>{action.label}</a>)}
      </nav>
    );
  }
  let descriptionContent = null;
  if (description)
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
