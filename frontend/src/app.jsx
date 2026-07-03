import { useCallback, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { pages } from './routing/pages';
import { getCurrentPath } from './routing/hashRouter';
import { clearStoredAuthSession, getStoredAuthSession, storeAuthSession, } from './features/auth/devUserStorage';
//
import { useRoom } from './features/room/useRoom';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { useProfile } from './features/profile/useProfile';
import { AppHeader } from './components/AppHeader';
import { StatusPanel } from './components/StatusPanel';
import { HomePage } from './pages/HomePage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { RoomPage } from './pages/RoomPage';
import { GamePage } from './pages/GamePage';
import { FriendsPage } from './pages/FriendsPage';
import { useFriends } from './features/friends/useFriends';
import { LobbyPage } from './pages/LobbyPage';

function App() {
  const [socket, setSocket] = useState(null);
  const [socketStatus, setSocketStatus] = useState('connecting');
  const [currentPath, setCurrentPath] = useState(getCurrentPath);

  const [devUserName, setDevUserName] = useState('');
  /*const [currentUser, setCurrentUser] = useState(getStoredDevUser);*/
  const storedSession = getStoredAuthSession();
  const [authSession, setAuthSession] = useState(storedSession);
  const [currentUser, setCurrentUser] = useState(storedSession?.user || null,);
  const [authStatus, setAuthStatus] = useState('idle');
  const [authError, setAuthError] = useState('');

  const [password, setPassword] = useState('');
  const room = useRoom(socket, currentUser);
  

  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');


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
  const handleSessionExpired = useCallback((message) => {
    setCurrentUser(null);
    setAuthSession(null);
    clearStoredAuthSession();
    setAuthStatus('error');
    setAuthError(message || 'Session expired. Login again.');
    window.location.hash = '#/login';
  }, []);

  const friends = useFriends(currentUser, authSession?.accessToken, handleSessionExpired,);
  const { profileUser, profileStatus, profileError } = useProfile(
    currentPage.id,
    currentUser,
    authSession?.accessToken,
    handleSessionExpired,
  );

  useEffect(() => {
    if (!authSession?.accessToken) {
      setSocket(null);
      setSocketStatus('disconnected');
      return undefined;
    }
    const nextSocket = io({
      path: '/socket.io',
      transports: ['websocket'],
      auth: {
        token: authSession.accessToken,
      },
    });
    // DEV DEBUG START app.jsx socket console exposure - remove lines until DEV DEBUG END.
    window.socket = nextSocket;
    // DEV DEBUG END app.jsx socket console exposure.
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
      if (error.message === 'Auth token missing' || error.message === 'Invalid auth token') {
        handleSessionExpired(error.message);
      }
    });
    // DEV DEBUG START app.jsx socket event console logs - remove lines until DEV DEBUG END.
    nextSocket.on('room:update', (...args) => console.log('room:update', ...args));
    nextSocket.on('room:error', (...args) => console.log('room:error', ...args));
    nextSocket.on('game:start', (...args) => console.log('game:start', ...args));
    nextSocket.on('player:input', (...args) => console.log('player:input', ...args));
    // DEV DEBUG END app.jsx socket event console logs.
    return () => {
      nextSocket.disconnect();
      setSocket(null);
    };
  }, [authSession?.accessToken, handleSessionExpired]);

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
      /*
      const user = await fetchCurrentUser(trimmedName);
      setCurrentUser(user);
      storeDevUser(user);
      setAuthStatus('authenticated');
      setDevUserName('');
      */
      const tokens = await loginUser(trimmedName, password);
      const user = await fetchCurrentUser(tokens.accessToken);

      const session = {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };

      setAuthSession(session);
      storeAuthSession(session);
      setCurrentUser(user);
      setAuthStatus('authenticated');
      setDevUserName('');
      setPassword('');
    } catch (error) {
      setCurrentUser(null);
      setAuthStatus('error');
      setAuthError(error.message);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();

    const trimmedName = devUserName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setAuthError('Enter username, email and password');
      return;
    }
    setAuthStatus('loading');
    setAuthError('');
    try {
      await registerUser(trimmedName, trimmedEmail, password);
      setAuthMode('login');
      setAuthStatus('idle');
      setAuthError('Accoumt created. you can login now');
      setPassword('');
      setEmail('');
    } catch (error) {
      setAuthStatus('error');
      setAuthError(error.message);
    }
  }

  function handleLogout() {
    setCurrentUser(null);
    /*clearStoredDevUser();*/
    setAuthSession(null);
    clearStoredAuthSession();
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
          {currentPage.id !== 'home' && currentPage.id !== 'login' && currentPage.id !== 'profile' && currentPage.id !== 'room' && currentPage.id !== 'game' && currentPage.id !== 'friends' && currentPage.id !== 'lobby' && (
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
              room={room}
            />
          )}
          {currentPage.id === 'game' && (
            <GamePage
              title={currentPage.title}
              description={currentPage.description}
              gameState={room.latestGameState}
              socket={socket}
              currentRoom={room.currentRoom}
              gameStarted={room.gameStarted}
            />
          )}
          {/* TODO register: pass authMode, setAuthMode, email, setEmail and handleRegister here. */}
          {currentPage.id === 'login' && (
            <LoginPage
              devUserName={devUserName}
              authStatus={authStatus}
              authError={authError}
              currentUser={currentUser}
              onDevUserNameChange={setDevUserName}
              onSubmit={handleDevLogin}
              onLogout={handleLogout}
              password={password}
              onPasswordChange={setPassword}
            />
          )}
          {currentPage.id === 'friends' && (
            <FriendsPage
              title={currentPage.title}
              description={currentPage.description}
              currentUser={currentUser}
              friends={friends}
            />
          )}
          {currentPage.id === 'lobby' && (
            <LobbyPage
              title={currentPage.title}
              description={currentPage.description}
              currentUser={currentUser}
              socket={socket}
              room={room}
            />
          )}
        </section>
        <StatusPanel socketStatus={socketStatus} currentUser={currentUser} />
      </main>
    </div>
  );
}

export default App;
