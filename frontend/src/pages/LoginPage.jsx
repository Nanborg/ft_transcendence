import { CurrentUserCard } from '../features/auth/CurrentUserCard';
import { DevLoginForm } from '../features/auth/DevLoginForm';

export function LoginPage({
  devUserName,
  authStatus,
  authError,
  currentUser,
  onDevUserNameChange,
  onSubmit,
  onLogout,
  password,
  onPasswordChange,
  authMode,
  onAuthModeChange,
  email,
  onEmailChange,
  onRegister,
}) {
  return (
    <div className="login-panel">
      <DevLoginForm
        devUserName={devUserName}
        authStatus={authStatus}
        onDevUserNameChange={onDevUserNameChange}
        password={password}
        onPasswordChange={onPasswordChange}
        onSubmit={onSubmit}
        authMode={authMode}
        onAuthModeChange={onAuthModeChange}
        email={email}
        onEmailChange={onEmailChange}
        onRegister={onRegister}
      />
      {authError && (
        <p className="form-error" role="alert">{authError}</p>
      )}
      {currentUser && (
        <CurrentUserCard currentUser={currentUser} onLogout={onLogout} />
      )}
      <nav className="legal-links" aria-label="Legal links">
        <a href="#/privacy">Privacy</a>
        <a href="#/terms">Terms</a>
      </nav>
    </div>
  );
}
