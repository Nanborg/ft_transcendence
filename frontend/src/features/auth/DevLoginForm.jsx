export function DevLoginForm({
  devUserName,
  authStatus,
  onDevUserNameChange,
  onSubmit,
  password,
  onPasswordChange,
  authMode,
  onAuthModeChange,
  email,
  onEmailChange,
  onRegister,
}) {
  function handleFortyTwoLogin() {
    window.location.href = '/api/login/42';
  }
  return (
    <form className="login-form" onSubmit={authMode === 'register' ? onRegister : onSubmit}>
      <label htmlFor="dev-user-name">Username</label>
      <input
        id="dev-user-name"
        type="text"
        value={devUserName}
        onChange={(event) => onDevUserNameChange(event.target.value)}
        placeholder="Username"
      />
      {authMode === 'register' && (
        <>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={event => onEmailChange(event.target.value)}
            placeholder="Email"
          />
        </>
      )}
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={event => onPasswordChange(event.target.value)}
      />
      <button
        type="button"
        onClick={() => onAuthModeChange(authMode === 'login' ? 'register' : 'login')}
      >
        {authMode === 'login' ? 'Create account' : 'Back to login'}
      </button>
      {authMode === 'login' && (
        <button type="button" onClick={handleFortyTwoLogin}>
          Login with 42
        </button>
      )}
      <button type="submit" disabled={authStatus === 'loading'}>
        {authStatus === 'loading' ? 'Loading...' : authMode === 'register' ? 'Create account' : 'Login'}
      </button>
    </form>
  );
}
