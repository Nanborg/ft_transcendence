export function LobbyPage({ title, description }) {
  return (
    <>
      <p className="page-kicker">Frontend page</p>
      <h1 id="page-title">{title}</h1>
      <p>{description}</p>

      <div className="lobby-panel">
        <h2>Enter a room</h2>

        <section>
          <h3>Create room</h3>
          <input placeholder="Room name" />
          <button type="button">Create room</button>
        </section>

        <section>
          <h3>Join room</h3>
          <input placeholder="Room id or name" />
          <button type="button">Join room</button>
        </section>
      </div>
    </>
  );
}