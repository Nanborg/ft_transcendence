import { CurrentUserCard } from '../features/auth/CurrentUserCard';
import { DevLoginForm } from '../features/auth/DevLoginForm';
import { PageHeading } from '../components/PageHeading';

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
    <div className="shell-screen shell-screen--login">
      <PageHeading
        title="Access"
        description="Open your player session"
        actions={[{ label: 'Back to Menu', href: '#/' }]}
      />
      <div className="login-panel">
        <div className="shell-window login-window">
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
        </div>
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
    </div>
  );
}
