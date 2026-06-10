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

function App() 
{
  const [socketStatus, setSocketStatus] = useState('connecting');
  const [currentPath, setCurrentPath] = useState(getCurrentPath);

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
