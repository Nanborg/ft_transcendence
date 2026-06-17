import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { pages } from './routing/pages';
import { getCurrentPath } from './routing/hashRouter';
import { clearStoredDevUser, getStoredDevUser, storeDevUser } from './features/auth/devUserStorage';
import { fetchCurrentUser } from './api/users';
import { LoginPage } from './pages/LoginPage';

function App() {
  const [socketStatus, setSocketStatus] = useState('connecting');
  const [currentPath, setCurrentPath] = useState(getCurrentPath);

  const [devUserName, setDevUserName] = useState('');
  const [currentUser, setCurrentUser] = useState(getStoredDevUser);
  const [authStatus, setAuthStatus] = useState('idle');
  const [authError, setAuthError] = useState('');

  const [profileUser, setProfileUser] = useState(null);
  const [profileStatus, setProfileStatus] = useState('idle');
  const [profileError, setProfileError] = useState('');

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

  useEffect(() => {
    if (currentPage.id !== 'profile') {
      return;
    }
    if (!currentUser) {
      setProfileUser(null);
      setProfileStatus('empty');
      setProfileError('');
      return;
    }
    setProfileStatus('loading');
    setProfileError('');
    async function loadProfile() {
      try {
        const user = await fetchCurrentUser(currentUser.name);
        setProfileUser(user);
        setProfileStatus('loaded');
      } catch (error) {
        setProfileUser(null);
        setProfileStatus('error');
        setProfileError(error.message);
      }
    }
    loadProfile();
  }, [currentPage.id, currentUser]);

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
            <div className="profile-panel">
              {profileStatus === 'empty' && (
                <div className="profile-empty">
                  <p>Login with a dev user to view your profile.</p>
                  <a href="#/login">Go to Login</a>
                </div>
              )}
              {profileStatus === 'loading' && (
                <p className="profile-loading">Loading profile...</p>
              )}
              {profileStatus === 'error' && (
                <p className="profile-error" role="alert">{profileError}</p>
              )}
              {profileStatus === 'loaded' && profileUser && (
                <dl className="profile-details">
                  <div>
                    <dt>ID</dt>
                    <dd>{profileUser.id || 'Not available'}</dd>
                  </div>
                  <div>
                    <dt>Name</dt>
                    <dd>{profileUser.name || 'Not available'}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{profileUser.email || 'Not available'}</dd>
                  </div>
                  <div>
                    <dt>Role</dt>
                    <dd>{profileUser.role || 'Not available'}</dd>
                  </div>
                </dl>
              )}
            </div>
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
