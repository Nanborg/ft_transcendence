import badgeIconsUrl from '../../assets/game/badges/badges_icons.png';


const BADGE_SPRITE_SIZE = {width: '320px', height: '256px'};
const BADGE_SPRITE_X = [4, 68, 128, 188, 252];
const BADGE_SPRITE_Y = [1, 61, 122, 184];

function getMilestone(value, steps)
{
  return steps.find(step => value < step) ?? steps[steps.length - 1];
}

const BADGE_GROUPS = [
  ['Experience', 'gamesPlayed', 0, [['Rookie', 5], ['Regular', 20], ['Veteran', 50], ['Legend', 200]]],
  ['Victories', 'wins', 1, [['First Win', 3], ['Winner', 10], ['Champion', 25], ['Conqueror', 50]]],
  [ 'Combat', 'totalDamageDealt', 2, [['Fighter', 5000], ['Striker', 15000], ['Destroyer', 30000], ['Warlord', 60000]]],
  ['Survivor', 'totalDamageReceived', 3, [['Survivor', 1000], ['Tank', 5000], ['Fortress', 15000], ['Guardian', 30000]]],
  ['Treasure', 'totalGoldEarned', 4, [['Collector', 1000], ['Hoarder', 5000], ['Tycoon', 15000], ['Golden King', 30000]]]]
.map(([label, valueKey, iconColumn, badges]) => ({label, valueKey, iconColumn, badges: badges.map(([name, threshold]) => ({ name, threshold})), }));

function getCurrentBadge(value, badges)
{
  const unlockedBadges = badges.filter(badge => value >= badge.threshold);
  const badge = unlockedBadges[unlockedBadges.length - 1] ?? badges[0];
  const tier = badges.indexOf(badge);

  return {
    ...badge,
    tier,
    unlocked: value >= badge.threshold,
  };
}

function getBadgeBackgroundPosition(iconColumn, tier)
{
  return `translate(-${BADGE_SPRITE_X[iconColumn]}px, -${BADGE_SPRITE_Y[tier]}px)`;
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
  const displayName = profileUser.username || 'Not available';
  const avatarUrl = profileUser.avatar?.trim();
  const avatarFallback = displayName.charAt(0).toUpperCase();
  const badges = BADGE_GROUPS.map(group => ({
    label: group.label,
    iconColumn: group.iconColumn,
    ...getCurrentBadge(stats[group.valueKey] ?? 0, group.badges),
  }));

  return (
    <section className="profile-details">
      <div>
        <h2>Profile</h2>
        <span className="profile-avatar" aria-label={`${displayName} avatar`}>
          {avatarUrl ? ( <img src={avatarUrl} alt="" /> ) : ( <span className= "profile-avatar-fallback">{avatarFallback}</span> )}
        </span>
        <p>{displayName}</p>
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
      <section className="profile-badges">
        <h2>Badges</h2>
        <div className="profile-badge-list">
          {badges.map(badge => (
            <article
              className={`badge-cell ${badge.unlocked ? 'is-unlocked' : 'is-locked'}`}
              key={`${badge.label}-${badge.name}`}
            >
              <span className="badge-icon-wrapper">
                <img
                  className="badge-icon"
                  alt=""
                  aria-hidden="true"
                  src={badgeIconsUrl}
                  style={{
                    ...BADGE_SPRITE_SIZE,
                    transform: getBadgeBackgroundPosition(badge.iconColumn, badge.tier),
                  }}
                />
              </span>
              <span className="badge-label">
                <strong>{badge.name}</strong>
              </span>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
