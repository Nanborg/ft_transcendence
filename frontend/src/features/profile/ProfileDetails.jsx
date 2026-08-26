function getMilestone(value, steps)
{
  return steps.find(step => value < step) ?? steps[steps.length - 1];
}

function ProgressRow({ label, value, target })
{
  const ratio = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return (
    <div className="profile-progress-row">
      <dt>{label}</dt>
      <dd>
        <span>{value} / {target}</span>
        <span className="profile-progress-bar">
          <span style={{ width: `${ratio}%` }}></span>
        </span>
      </dd>
    </div>
  );
}

export function ProfileDetails({ profileUser }) {
  const stats = profileUser.stats ?? {};
  const gamesPlayed = stats.gamesPlayed ?? 0;
  const wins = stats.wins ?? 0;
  const damageDealt = stats.totalDamageDealt ?? 0;
  const damageReceived = stats.totalDamageReceived ?? 0;
  const goldEarned = stats.totalGoldEarned ?? 0;

  return (
    <section className="profile-details">
      <div>
        <h2>Profile</h2>
        <p>{profileUser.username || 'Not available'}</p>
      </div>
      <dl>
        <h2>Progression</h2>
        <ProgressRow label="Games played" value={gamesPlayed} target={getMilestone(gamesPlayed, [5, 20, 50, 200])} />
        <ProgressRow label="Wins" value={wins} target={getMilestone(wins, [3, 10, 25, 50])} />
        <ProgressRow label="Damage dealt" value={damageDealt} target={getMilestone(damageDealt, [5000, 15000, 30000])} />
        <ProgressRow label="Damage received" value={damageReceived} target={getMilestone(damageReceived, [1000, 5000, 15000])} />
        <ProgressRow label="Gold earned" value={goldEarned} target={getMilestone(goldEarned, [1000, 5000, 15000])} />
      </dl>
      <dl>
        <h2>Performance</h2>
        <div>
          <dt>Win rate</dt>
          <dd>{stats.winRate ?? 0}%</dd>
        </div>
      </dl>
    </section>
  );
}
