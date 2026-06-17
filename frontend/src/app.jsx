import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { pages } from './routing/pages';
import { getCurrentPath } from './routing/hashRouter';
import { clearStoredDevUser, getStoredDevUser, storeDevUser } from './features/auth/devUserStorage';
import { fetchCurrentUser } from './api/users';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { useProfile } from './features/profile/useProfile';

function App() {
  const [socketStatus, setSocketStatus] = useState('connecting');
  const [currentPath, setCurrentPath] = useState(getCurrentPath);

  const [devUserName, setDevUserName] = useState('');
  const [currentUser, setCurrentUser] = useState(getStoredDevUser);
  const [authStatus, setAuthStatus] = useState('idle');
  const [authError, setAuthError] = useState('');


  useEffect(() => {
    if (currentUser) {
      setAuthStatus('authenticated');
    }
  }, [currentUser]);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(getCurrentPath());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const currentPage = useMemo(() => {
    return pages.find(page => page.path === currentPath) || pages[0];
  }, [currentPath]);
  const { profileUser, profileStatus, profileError } = useProfile(currentPage.id, currentUser);


  useEffect(() => {
    const socket = io({
      path: '/socket.io',
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setSocketStatus(`connected: ${socket.id}`);
      console.log('socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      setSocketStatus('disconnected');
      console.log('socket disconnected');
    });

    socket.on('connect_error', (error) => {
      setSocketStatus(`connection error: ${error.message}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  async function handleDevLogin(event) {
    event.preventDefault();
    const trimmedName = devUserName.trim();
    if (!trimmedName) {
      setAuthError('Enter a username to login');
      return;
    }
    setAuthStatus('loading');
    setAuthError('');
    try {
      const user = await fetchCurrentUser(trimmedName);
      setCurrentUser(user);
      storeDevUser(user);
      setAuthStatus('authenticated');
      setDevUserName('');
    } catch (error) {
      setCurrentUser(null);
      setAuthStatus('error');
      setAuthError(error.message);
    }
  }

  function handleLogout() {
    setCurrentUser(null);
    clearStoredDevUser();
    setAuthStatus('idle');
    setAuthError('');
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="#/">
          ft_transcendence
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          {pages.map((page) => (
            <a
              key={page.id}
              href={`#${page.path}`}
              aria-current={currentPage.id === page.id ? 'page' : undefined}
            >
              {page.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="page-content">
        <section className="page-panel" aria-labelledby="page-title">
          <p className="page-kicker">Frontend page</p>
          <h1 id="page-title">{currentPage.title}</h1>
          <p>{currentPage.description}</p>
          {currentPage.id === 'profile' && (
            <ProfilePage
              profileStatus={profileStatus}
              profileError={profileError}
              profileUser={profileUser}
            />
          )}
          {currentPage.id === 'login' && (
            <LoginPage
              devUserName={devUserName}
              authStatus={authStatus}
              authError={authError}
              currentUser={currentUser}
              onDevUserNameChange={setDevUserName}
              onSubmit={handleDevLogin}
              onLogout={handleLogout}
            />
          )}
        </section>

        <aside className="status-panel" aria-label="Connection status">
          <h2>System status</h2>
          <p>Socket.IO: {socketStatus}</p>
          <p>Session: {currentUser ? currentUser.name : 'not logged in'}</p>
        </aside>
      </main>
    </div>
  );
}

export default App;
