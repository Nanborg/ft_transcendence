import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { pages } from './routing/pages';
import { getCurrentPath } from './routing/hashRouter';
import { clearStoredDevUser, getStoredDevUser, storeDevUser } from './features/auth/devUserStorage';
import { fetchCurrentUser } from './api/users';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { useProfile } from './features/profile/useProfile';
import { AppHeader } from './components/AppHeader';
import { StatusPanel } from './components/StatusPanel';
import { HomePage } from './pages/HomePage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { RoomPage } from './pages/RoomPage';
import { GamePage } from './pages/GamePage';

function App() {
  const [socket, setSocket] = useState(null);
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
    const nextSocket = io({
      path: '/socket.io',
      transports: ['websocket'],
    });
    setSocket(nextSocket);

    nextSocket.on('connect', () => {
      setSocketStatus(`connected: ${nextSocket.id}`);
      console.log('socket connected:', nextSocket.id);
    });

    nextSocket.on('disconnect', () => {
      setSocketStatus('disconnected');
      console.log('socket disconnected');
    });

    nextSocket.on('connect_error', (error) => {
      setSocketStatus(`connection error: ${error.message}`);
    });

    return () => {
      nextSocket.disconnect();
      setSocket(null);
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
      <AppHeader pages={pages} currentPageId={currentPage.id} />
      <main className="page-content">
        <section className="page-panel" aria-labelledby="page-title">
          {currentPage.id === 'home' && (
            <HomePage title={currentPage.title} description={currentPage.description} />
          )}
          {currentPage.id !== 'home' && currentPage.id !== 'login' && currentPage.id !== 'profile' && currentPage.id !== 'room' && currentPage.id !== 'game' && (
            <PlaceholderPage title={currentPage.title} description={currentPage.description} />
          )}
          {currentPage.id === 'profile' && (
            <ProfilePage
              profileStatus={profileStatus}
              profileError={profileError}
              profileUser={profileUser}
            />
          )}
          {currentPage.id === 'room' && (
            <RoomPage
              title={currentPage.title}
              description={currentPage.description}
              socket={socket}
              currentUser={currentUser}
            />
          )}
          {currentPage.id === 'game' && (
            <GamePage
              title={currentPage.title}
              description={currentPage.description}
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
        <StatusPanel socketStatus={socketStatus} currentUser={currentUser} />
      </main>
    </div>
  );
}

export default App;
