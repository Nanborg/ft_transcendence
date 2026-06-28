export function DevLoginForm({
  devUserName,
  authStatus,
  onDevUserNameChange,
  onSubmit,
  password,
  onPasswordChange,
  // TODO register: accept authMode, onAuthModeChange, email, onEmailChange and onRegister props here.
}) {
  return (
    /* TODO register: switch form onSubmit between onSubmit and onRegister here. */
    <form className="login-form" onSubmit={onSubmit}>
      <label htmlFor="dev-user-name">Username</label>
      <input
        id="dev-user-name"
        type="text"
        value={devUserName}
        onChange={(event) => onDevUserNameChange(event.target.value)}
        placeholder="Username"
        /* TODO register: render the email input here only when authMode is register. */
      />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={event => onPasswordChange(event.target.value)}
      />
      /* TODO register: add the Login/Register mode switch button here. */
      <button type="submit" disabled={authStatus === 'loading'}>
        {authStatus === 'loading' ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}