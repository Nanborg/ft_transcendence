import playerIdleSpriteUrl from '../assets/game/player/player-idle.png';

const authenticatedActions = [
  { label: 'Play', href: '#/lobby' },
  { label: 'Profile', href: '#/profile' },
  { label: 'Friends', href: '#/friends' },
  { label: 'Leaderboard', href: '#/leaderboard' },
  { label: 'Match History', href: '#/match-history' },
];

export function HomePage({ title, description, currentUser, room, onLogout })
{
  const currentRoom = room?.currentRoom;
  let resumeAction = null;
  if (currentRoom?.status === 'playing')
    resumeAction = { label: 'Resume Game', href: '#/game' };
  else if (currentRoom)
    resumeAction = { label: 'Resume Room', href: '#/room' };
  let actions = authenticatedActions;
  if (resumeAction)
    actions = [resumeAction, ...authenticatedActions];
  let menuContent = (
    <div className="home-menu-actions home-menu-actions--locked">
      <a className="home-menu-card home-menu-card--primary" href="#/login"><strong>Login</strong></a>
    </div>
  );
  if (currentUser)
  {
    menuContent = (
      <nav className="home-menu-actions" aria-label="Main menu">
        {actions.map((action) => (
          <a className="home-menu-card" href={action.href} key={action.href}><strong>{action.label}</strong></a>
        ))}
        <button className="home-menu-card home-menu-card--button" type="button" onClick={onLogout}><strong>Logout</strong></button>
      </nav>
    );
  }

  return (
    <section className="home-game-window">
      <div className="home-game-scene" aria-hidden="true" />

      <div
        className="home-idle-players"
        style={{'--home-player-idle-sprite': `url(${playerIdleSpriteUrl})`}}
        aria-hidden="true"
      >
        <span className="home-idle-player" />
      </div>
      <div className="home-main-menu">
        <h1 id="page-title">{title}</h1>
        {description && <p>{description}</p>}
        {menuContent}
      </div>
    </section>
  );
}
