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
      <label className="form-label" htmlFor="dev-user-name">Username</label>
      <input
        id="dev-user-name"
        className="form-control"
        type="text"
        value={devUserName}
        onChange={(event) => onDevUserNameChange(event.target.value)}
        placeholder="Username"
      />
      {authMode === 'register' && (
        <>
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            className="form-control"
            type="email"
            value={email}
            onChange={event => onEmailChange(event.target.value)}
            placeholder="Email"
          />
        </>
      )}
      <label className="form-label" htmlFor="password">Password</label>
      <input
        id="password"
        className="form-control"
        type="password"
        value={password}
        onChange={event => onPasswordChange(event.target.value)}
      />
      <button
        className="btn btn-outline-info"
        type="button"
        onClick={() => onAuthModeChange(authMode === 'login' ? 'register' : 'login')}
      >
        {authMode === 'login' ? 'Create account' : 'Back to login'}
      </button>
      {authMode === 'login' && (
        <button className="btn btn-outline-light" type="button" onClick={handleFortyTwoLogin}>
          Login with 42
        </button>
      )}
      <button className="btn btn-success" type="submit" disabled={authStatus === 'loading'}>
        {authStatus === 'loading' ? 'Loading...' : authMode === 'register' ? 'Create account' : 'Login'}
      </button>
    </form>
  );
}
