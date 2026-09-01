import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { pages } from './routing/pages';
import { getCurrentPath } from './routing/hashRouter';
import { AUTH_SESSION_CHANGED_EVENT, clearAuthSession, getStoredAuthSession, setAuthSession as writeAuthSession } from './features/auth/devUserStorage';
import { fetchCurrentUser, loginUser, logoutUser, registerUser, updateCurrentUser } from './api/users';
import { refreshAuthSession } from './api/tokenRefresh';
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
import { LeaderboardPage } from './pages/LeaderboardPage';
import { MatchHistoryPage } from './pages/MatchHistoryPage';
import { LegalPage } from './pages/LegalPage';
import privacyPolicy from 'legal-docs/privacy-policy.md?raw';
import termsOfService from 'legal-docs/terms-of-service.md?raw';

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
  const sessionExpiredRef = useRef(false); //test-nico

  const [password, setPassword] = useState('');
  const room = useRoom(socket, currentUser);


  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');


  useEffect(() => {
    if (currentUser) {
      setAuthStatus('authenticated');
    }
  }, [currentUser]);

  useEffect(() => { //test-nico
    function applySession(session) {
      setAuthSession(session);
      setCurrentUser(session?.user || null);
      if (session?.user) {
        sessionExpiredRef.current = false;
        setAuthStatus('authenticated');
        setAuthError('');
      }
    }
    function handleSessionChanged(event) {
      applySession(event.detail);
    }
    function handleStorage(event) {
      if (event.key !== 'ft_transcendence_auth_session') {
        return;
      }
      applySession(getStoredAuthSession());
    }
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChanged);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChanged);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

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
  const handleSessionExpired = useCallback((message) => { //test-nico
    if (sessionExpiredRef.current) {
      return;
    }
    sessionExpiredRef.current = true;
    setCurrentUser(null);
    setAuthSession(null);
    clearAuthSession();
    setAuthStatus('error');
    setAuthError(message || 'Session expired. Login again.');
    window.location.hash = '#/login';
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    const queryIndex = hash.indexOf('?');

    if (queryIndex === -1) {
      return;
    }

    const params = new URLSearchParams(hash.slice(queryIndex + 1));
    const isFortyTwoOauth = params.get('oauth') === '42';
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (!isFortyTwoOauth || !accessToken || !refreshToken) {
      return;
    }
    window.history.replaceState(null, '', '#/login'); //test-nico

    async function finishFortyTwoLogin() {
      setAuthStatus('loading');
        setAuthError('');
      try {
        const pendingSession = { accessToken, refreshToken };
        writeAuthSession(pendingSession); //test-nico
        const user = await fetchCurrentUser(accessToken);
        const session = { ...pendingSession, user };

        writeAuthSession(session); //test-nico
        setCurrentUser(user);
        setAuthStatus('authenticated');
        window.location.hash = '#/profile';
      } catch (error) {
        setCurrentUser(null);
        setAuthSession(null);
        clearAuthSession();
        setAuthStatus('error');
        setAuthError(error.message);
        window.location.hash = '#/login';
      }
    }

    finishFortyTwoLogin();
  }, []);

  const friends = useFriends(currentUser, authSession?.accessToken, handleSessionExpired,);
  const { profileUser, profileStatus, profileError } = useProfile(
    currentPage.id,
    currentUser,
    authSession?.accessToken,
    handleSessionExpired,
  );

  useEffect(() => { //test-nico
    if (!socket || !authSession?.accessToken) {
      return;
    }
    socket.auth = {
      ...(socket.auth || {}),
      token: authSession.accessToken,
    };
  }, [socket, authSession?.accessToken]);

  useEffect(() => { //test-nico
    if (!currentUser || !authSession?.accessToken) {
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
    let connectionReplacedMessage = '';
    let reconnectAfterRefresh = false;
    setSocket(nextSocket);

    nextSocket.on('connection:replaced', (payload = {}) => {
        connectionReplacedMessage =
            typeof payload.message === 'string'
                ? payload.message
                : 'This account was opened in another tab or browser.';

        setSocketStatus(
            `connection replaced: ${connectionReplacedMessage}`
        );
    });
    nextSocket.on('connect', () => {
      setSocketStatus(`connected: ${nextSocket.id}`);
    });

    nextSocket.on('disconnect', () => {
        if (connectionReplacedMessage) {
            setSocketStatus(
                `connection replaced: ${connectionReplacedMessage}`
            );
        } else {
            setSocketStatus('disconnected');
        }
    });

    nextSocket.on('connect_error', async (error) => { //test-nico
      setSocketStatus(`connection error: ${error.message}`);
      const code = error.data?.code;
      if (code === 'TOKEN_INVALID' || code === 'TOKEN_MISSING') {
        handleSessionExpired(error.message);
        return;
      }
      if (code !== 'TOKEN_EXPIRED' || reconnectAfterRefresh) {
        return;
      }
      reconnectAfterRefresh = true;
      try {
        const latestSession = getStoredAuthSession();
        if (!latestSession?.accessToken) {
          handleSessionExpired(error.message);
          return;
        }
        let nextSession = latestSession;
        if (latestSession.accessToken === nextSocket.auth?.token) {
          nextSession = await refreshAuthSession(latestSession);
        }
        nextSocket.auth = {
          ...(nextSocket.auth || {}),
          token: nextSession.accessToken,
        };
        nextSocket.connect();
      } catch (refreshError) {
        handleSessionExpired(refreshError.message);
      }
    });
    return () => {
      nextSocket.disconnect();
      setSocket(null);
    };
  }, [currentUser?.id, Boolean(authSession?.accessToken), handleSessionExpired]);

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
      const tokens = await loginUser(trimmedName, password);
      const pendingSession = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
      writeAuthSession(pendingSession); //test-nico
      const user = await fetchCurrentUser(tokens.accessToken);

      const session = {
        ...pendingSession,
        user,
      };

      writeAuthSession(session); //test-nico
      setCurrentUser(user);
      setAuthStatus('authenticated');
      setDevUserName('');
      setPassword('');
    } catch (error) {
      setCurrentUser(null);
      setAuthSession(null);
      clearAuthSession();
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
      setAuthError('Account created. you can login now');
      setPassword('');
      setEmail('');
    } catch (error) {
      setAuthStatus('error');
      setAuthError(error.message);
    }
  }

  async function handleLogout() {
    const session = getStoredAuthSession();
    try {
      await logoutUser(session?.refreshToken); //test-nico
    } catch {
      // Local logout must complete even when the network request fails.
    }
    setCurrentUser(null);
    setAuthSession(null);
    clearAuthSession();
    setAuthStatus('idle');
    setAuthError('');
  }

  return (
    <div className="app-shell">
      {currentPage.id !== 'home' && (<AppHeader pages={pages} currentPageId={currentPage.id} />)}
      <main className={`page-content page-content--${currentPage.id}`}>
        <section className="page-panel" aria-labelledby="page-title">
          {currentPage.id === 'home' && (
            <HomePage
              title={currentPage.title}
              description={currentPage.description}
              pages={pages}
              currentPageId={currentPage.id}
            />
          )}
          {currentPage.id !== 'home' && currentPage.id !== 'match-history' && currentPage.id !== 'leaderboard' && currentPage.id !== 'login' && currentPage.id !== 'profile' && currentPage.id !== 'room' && currentPage.id !== 'game' && currentPage.id !== 'friends' && currentPage.id !== 'lobby' && currentPage.id !== 'privacy' && currentPage.id !== 'terms' && (
            <PlaceholderPage title={currentPage.title} description={currentPage.description} />
          )}
          {currentPage.id === 'privacy' && (
            <LegalPage
              title={currentPage.title}
              description={currentPage.description}
              content={privacyPolicy}
            />
          )}
          {currentPage.id === 'terms' && (
            <LegalPage
              title={currentPage.title}
              description={currentPage.description}
              content={termsOfService}
            />
          )}
          {currentPage.id === 'profile' && (
            <ProfilePage
              profileStatus={profileStatus}
              profileError={profileError}
              profileUser={profileUser}
              accessToken={authSession?.accessToken}
              onSessionExpired={handleSessionExpired}
              onProfileUpdated={(user) => {
                setCurrentUser(user);
                const latestSession = getStoredAuthSession();
                if (latestSession) {
                  writeAuthSession({ ...latestSession, user }); //test-nico
                }
              }}
              onUpdateProfile={updateCurrentUser}
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
              currentPlayerId={currentUser?.id}
              gameMap={room.gameMap}
              gameEntities={room.gameEntities}
              deletedGameEntities={room.deletedGameEntities}
              gameStartedAt={room.gameStartedAt}
              gamePlayerData={room.gamePlayerData}
              gameError={room.gameError}
              gameResult={room.gameResult}
              socket={socket}
              currentRoom={room.currentRoom}
              gameStarted={room.gameStarted}
              onLeaveGame={room.leaveGame}
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
              password={password}
              onPasswordChange={setPassword}
              authMode={authMode}
              onAuthModeChange={setAuthMode}
              email={email}
              onEmailChange={setEmail}
              onRegister={handleRegister}
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
          {currentPage.id === 'leaderboard' && (
            <LeaderboardPage
              title={currentPage.title}
              description={currentPage.description}
            />
          )}
          {currentPage.id === 'match-history' && (
            <MatchHistoryPage
              title={currentPage.title}
              description={currentPage.description}
              accessToken={authSession?.accessToken}
            />
          )}
        </section>
        {currentPage.id !== 'home' && currentPage.id !== 'profile' && ( <StatusPanel socketStatus={socketStatus} currentUser={currentUser} />)}
      </main>
    </div>
  );
}

export default App;
