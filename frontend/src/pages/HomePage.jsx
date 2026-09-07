import { AppHeader } from '../components/AppHeader';

const authenticatedActions = [
  { label: 'Play', href: '#/lobby', meta: 'Create or join a room' },
  { label: 'Profile', href: '#/profile', meta: 'Player dossier' },
  { label: 'Friends', href: '#/friends', meta: 'Social terminal' },
  { label: 'Leaderboard', href: '#/leaderboard', meta: 'Rankings' },
  { label: 'Match History', href: '#/match-history', meta: 'Mission log' },
];

export function HomePage({ title, description, currentUser, room, onLogout })
{
  const displayName = currentUser?.username || currentUser?.name || 'Player';
  const currentRoom = room?.currentRoom;
  const resumeAction = currentRoom?.status === 'playing'
    ? { label: 'Resume Game', href: '#/game', meta: currentRoom.name || currentRoom.id }
    : currentRoom
      ? { label: 'Resume Room', href: '#/room', meta: currentRoom.name || currentRoom.id }
      : null;
  const actions = resumeAction ? [resumeAction, ...authenticatedActions] : authenticatedActions;
  return (
    <section className="home-game-window">
      <AppHeader />
      <div className="home-game-scene" aria-hidden="true">
        <div className="home-arena-grid" />
      </div>
      <div className="home-main-menu">
        <p className="page-kicker">{currentUser ? `Session: ${displayName}` : 'Session locked'}</p>
        <h1 id="page-title">{title}</h1>
        <p>{description}</p>
        {!currentUser ? (
          <div className="home-menu-actions home-menu-actions--locked">
            <a className="home-menu-card home-menu-card--primary" href="#/login">
              <strong>Login</strong>
              <span>Open access panel</span>
            </a>
          </div>
        ) : (
          <nav className="home-menu-actions" aria-label="Main menu">
            {actions.map(action => (
              <a className="home-menu-card" href={action.href} key={action.href}>
                <strong>{action.label}</strong>
                <span>{action.meta}</span>
              </a>
            ))}
            <button className="home-menu-card home-menu-card--button" type="button" onClick={onLogout}>
              <strong>Logout</strong>
              <span>Close current session</span>
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
