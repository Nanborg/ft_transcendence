export function PageHeading({ title, description }) {
  return (
    <>
      <p className="page-kicker">Frontend page</p>
      <h1 id="page-title">{title}</h1>
      <p>{description}</p>
    </>
  );
}
