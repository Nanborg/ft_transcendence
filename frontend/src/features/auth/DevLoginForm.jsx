export function DevLoginForm({
  devUserName,
  authStatus,
  onDevUserNameChange,
  onSubmit,
}) {
  return (
    <form className="login-form" onSubmit={onSubmit}>
      <label htmlFor="dev-user-name">Dev user name</label>
      <input
        id="dev-user-name"
        type="text"
        value={devUserName}
        onChange={(event) => onDevUserNameChange(event.target.value)}
        placeholder="nico"
      />
      <button type="submit" disabled={authStatus === 'loading'}>
        {authStatus === 'loading' ? 'Logging in...' : 'Login as dev user'}
      </button>
    </form>
  );
}