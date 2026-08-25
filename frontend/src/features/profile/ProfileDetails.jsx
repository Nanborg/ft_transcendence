export function ProfileDetails({ profileUser }) {
  return (
    <dl className="profile-details">
      <div>
        <dt>ID</dt>
        <dd>{profileUser.id || 'Not available'}</dd>
      </div>
      <div>
        <dt>Name</dt>
        <dd>{profileUser.username || 'Not available'}</dd>
      </div>
      <div>
        <dt>Email</dt>
        <dd>{profileUser.email || 'Not available'}</dd>
      </div>
      <div>
        <dt>Games played</dt>
        <dd>{profileUser.stats?.gamesPlayed ?? 0}</dd>
      </div>
      <div>
        <dt>Wins</dt>
        <dd>{profileUser.stats?.wins ?? 0}</dd>
      </div>
      <div>
        <dt>Losses</dt>
        <dd>{profileUser.stats?.losses ?? 0}</dd>
      </div>
      <div>
        <dt>Role</dt>
        <dd>{profileUser.role || 'Not available'}</dd>
      </div>
    </dl>
  );
}
