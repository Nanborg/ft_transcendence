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
        <dt>Win rate</dt>
        <dd>{profileUser.stats?.winRate ?? 0}%</dd>
      </div>
      <div>
        <dt>Total deaths</dt>
        <dd>{profileUser.stats?.totalDeaths ?? 0}</dd>
      </div>
      <div>
        <dt>Damage dealt</dt>
        <dd>{profileUser.stats?.totalDamageDealt ?? 0}</dd>
      </div>
      <div>
        <dt>Damage received</dt>
        <dd>{profileUser.stats?.totalDamageReceived ?? 0}</dd>
      </div>
      <div>
        <dt>Gold earned</dt>
        <dd>{profileUser.stats?.totalGoldEarned ?? 0}</dd>
      </div>
      <div>
        <dt>Role</dt>
        <dd>{profileUser.role || 'Not available'}</dd>
      </div>
    </dl>
  );
}
