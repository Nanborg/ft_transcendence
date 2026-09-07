export function PageHeading({ title, description, actions = [] }) {
  return (
    <header className="page-heading">
      <div>
        <span className="page-heading-kicker">Command</span>
        <h1 id="page-title">{title}</h1>
      </div>
      <p>{description}</p>
      {actions.length > 0 && (
        <nav className="page-heading-actions" aria-label={`${title} actions`}>
          {actions.map(action => (
            <a className="btn btn-outline-info" href={action.href} key={`${action.href}-${action.label}`}>
              {action.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
