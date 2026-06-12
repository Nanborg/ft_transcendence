import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';


const pages = [
  {
    id: 'home',
    path: '/',
    label: 'Home',
    title: 'Home',
    description: 'Welcome to ft_transcendence',
  },
  {
    id: 'login',
    path: '/login',
    label: 'Login',
    title: 'Login',
    description: 'Login to your account',
  },
  {
    id: 'profile',
    path: '/profile',
    label: 'Profile',
    title: 'Profile',
    description: 'View your profile',
  },
  {
    id: 'friends',
    path: '/friends',
    label: 'Friends',
    title: 'Friends',
    description: 'View your friends',
  },
  {
    id: 'lobby',
    path: '/lobby',
    label: 'Lobby',
    title: 'Lobby',
    description: 'Enter the lobby',
  },
  {
    id: 'room',
    path: '/room',
    label: 'Room',
    title: 'Room',
    description: 'Enter a room',
  },
  {
    id: 'game',
    path: '/game',
    label: 'Game',
    title: 'Game',
    description: 'Play a game',
  },
  {
    id: 'leaderboard',
    path: '/leaderboard',
    label: 'Leaderboard',
    title: 'Leaderboard',
    description: 'View the leaderboard',
  },
  {
    id: 'match-history',
    path: '/match-history',
    label: 'Match History',
    title: 'Match History',
    description: 'View your match history',
  },
];

function getCurrentPath() {
  const hashPath = window.location.hash.replace(/^#/, '');
  if (!hashPath || hashPath === '/') {
    return '/';
  }
  return hashPath;
}

const DEV_USER_STORAGE_KEY = 'ft_transcendence_dev_user';

function getStoredDevUser() {
  try {
    const storedUser = window.localStorage.getItem(DEV_USER_STORAGE_KEY);

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch {
    window.localStorage.removeItem(DEV_USER_STORAGE_KEY);
    return null;
  }
}


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
      const response = await fetch('/api/users/me', {
        headers: {
          'x-dev-user': trimmedName,
        },
      });
      if (!response.ok) {
        throw new Error('Login failed.');
      }
      const user = await response.json();
      setCurrentUser(user);
      window.localStorage.setItem(DEV_USER_STORAGE_KEY, JSON.stringify(user));
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
    window.localStorage.removeItem(DEV_USER_STORAGE_KEY);
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
          {currentPage.id === 'login' && (
            <div className="login-panel">
              <form className="login-form" onSubmit={handleDevLogin}>
                <label htmlFor="dev-user-name">Dev user name</label>
                <input
                  id="dev-user-name"
                  type="text"
                  value={devUserName}
                  onChange={(event) => setDevUserName(event.target.value)}
                  placeholder="nico"
                />
              </form>
            </div>
          )}
        </section>

        <aside className="status-panel" aria-label="Connection status">
          <h2>System status</h2>
          <p>Socket.IO: {socketStatus}</p>
        </aside>
      </main>
    </div>
  );
}

export default App;
