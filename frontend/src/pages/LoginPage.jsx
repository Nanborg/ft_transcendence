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
      />
      {authError && (
        <p className="form-error" role="alert">{authError}</p>
      )}
      {currentUser && (
        <CurrentUserCard currentUser={currentUser} onLogout={onLogout} />
      )}
    </div>
  );
}