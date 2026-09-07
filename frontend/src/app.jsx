import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { pages } from './routing/pages';
import { getCurrentPath } from './routing/hashRouter';
import { AUTH_SESSION_CHANGED_EVENT, clearAuthSession, getStoredAuthSession, setAuthSession as writeAuthSession } from './features/auth/devUserStorage';
import { fetchCurrentUser, loginUser, logoutUser, registerUser, updateCurrentUser } from './api/users';
import { refreshAccessToken } from './api/tokenRefresh';
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
import { useChat } from './features/chat/useChat';
import { LegalPage } from './pages/LegalPage';
import { useDirectChat } from './features/chat/useDirectChat';
import { GlobalChatDock } from './features/chat/GlobalChatDock';
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
  const sessionExpiredRef = useRef(false);

  const [password, setPassword] = useState('');
  const room = useRoom(socket, currentUser);
  const directChat = useDirectChat(socket, currentUser);
  const chat = useChat(socket, currentUser, room.currentRoom, directChat.blockedUserIds);
  const [isGlobalChatInputFocused, setIsGlobalChatInputFocused] = useState(false);


  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');


  useEffect(() => {
    if (currentUser) {
      setAuthStatus('authenticated');
    }
  }, [currentUser]);

  useEffect(() => {
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
  const handleSessionExpired = useCallback((message) => {
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
    const isFortyTwoOauth = params.get('oauth') === 'success';

    if (!isFortyTwoOauth) {
      return;
    }
        window.history.replaceState(null, '', '#/login');

    async function finishFortyTwoLogin() {
      setAuthStatus('loading');
        setAuthError('');
      try {
        const user = await fetchCurrentUser();
        const session = { user };

        writeAuthSession(session);
        setCurrentUser(user);
        setAuthStatus('authenticated');
        window.location.hash = '#/';
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

  const friends = useFriends(socket, currentUser, handleSessionExpired,);
  const { profileUser, profileStatus, profileError } = useProfile(
    currentPage.id,
    currentUser,
    handleSessionExpired,
  );

  useEffect(() => {
    if (!currentUser) {
      setSocket(null);
      setSocketStatus('disconnected');
      return undefined;
    }
    const nextSocket = io({
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true,
      forceNew: true,
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
      reconnectAfterRefresh = false;
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

    nextSocket.on('connect_error', async (error) => {
      setSocketStatus(`connection error: ${error.message}`);
      if (error.data?.code !== 'ACCESS_TOKEN_EXPIRED' && error.data?.code !== 'ACCESS_TOKEN_MISSING') {
        handleSessionExpired(error.message);
        nextSocket.disconnect();
        return;
      }
      if (reconnectAfterRefresh) {
        handleSessionExpired(error.message);
        nextSocket.disconnect();
        return;
      }
      reconnectAfterRefresh = true;
      try {
        await refreshAccessToken();
        nextSocket.connect();
      } catch (refreshError) {
        handleSessionExpired(refreshError.message);
        nextSocket.disconnect();
      }
    });
    return () => {
      nextSocket.disconnect();
      setSocket(null);
    };
  }, [currentUser, handleSessionExpired]);

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
      await loginUser(trimmedName, password);
      const user = await fetchCurrentUser();

      const session = { user };

      writeAuthSession(session);
      setCurrentUser(user);
      setAuthStatus('authenticated');
      setDevUserName('');
      setPassword('');
      window.location.hash = '#/';
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
    try {
      await logoutUser();
    } catch {
      // Local logout must complete even when the network request fails.
    }
    if (socket)
      socket.disconnect();
    setCurrentUser(null);
    setAuthSession(null);
    clearAuthSession();
    setAuthStatus('idle');
    setAuthError('');
  }

  return (
    <div className="app-shell">
      {currentPage.id !== 'home' && currentPage.id !== 'game' && (<AppHeader />)}
      <main className={`page-content page-content--${currentPage.id}`}>
        <section className="page-panel" aria-labelledby="page-title">
          {currentPage.id === 'home' && (
            <HomePage
              title={currentPage.title}
              description={currentPage.description}
              currentUser={currentUser}
              room={room}
              onLogout={handleLogout}
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
              onSessionExpired={handleSessionExpired}
              onProfileUpdated={(user) => {
                setCurrentUser(user);
                const latestSession = getStoredAuthSession();
                if (latestSession) {
                  writeAuthSession({ ...latestSession, user });
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
              chat={chat}
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
              chatInputFocused={isGlobalChatInputFocused}
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
              directChat={directChat}
            />
          )}
          {currentPage.id === 'lobby' && (
            <LobbyPage
              title={currentPage.title}
              description={currentPage.description}
              currentUser={currentUser}
              socket={socket}
              room={room}
              friends={friends}
              directChat={directChat}
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
            />
          )}
        </section>
        {currentPage.id !== 'home' && currentPage.id !== 'profile' && currentPage.id !== 'login' && currentPage.id !== 'game' && ( <StatusPanel socketStatus={socketStatus} currentUser={currentUser} />)}
      </main>
      <GlobalChatDock
        currentUser={currentUser}
        currentRoom={room.currentRoom}
        roomChat={chat}
        directChat={directChat}
        onInputFocusChange={setIsGlobalChatInputFocused}
        keyboardShortcutEnabled={currentPage.id === 'game'}
      />
    </div>
  );
}

export default App;
