import badgeIconsUrl from '../../assets/game/badges/badges_icons.png';

const BADGE_SPRITE_COLUMNS = 5;
const BADGE_SPRITE_ROWS = 4;
const BADGE_ICON_SIZE = 64;
const BADGE_SPRITE_SIZE = {
  width: `${BADGE_SPRITE_COLUMNS * BADGE_ICON_SIZE}px`,
  height: `${BADGE_SPRITE_ROWS * BADGE_ICON_SIZE}px`,
};
const BADGE_SPRITE_X = [4, 68, 128, 188, 252];
const BADGE_SPRITE_Y = [1, 61, 122, 184];

function getMilestone(value, steps)
{
  return steps.find(step => value < step) ?? steps[steps.length - 1];
}

const BADGE_GROUPS = [
  {
    label: 'Experience',
    valueKey: 'gamesPlayed',
    iconColumn: 0,
    badges: [
      { name: 'Rookie', threshold: 5 },
      { name: 'Regular', threshold: 20 },
      { name: 'Veteran', threshold: 50 },
      { name: 'Legend', threshold: 200 },
    ],
  },
  {
    label: 'Victories',
    valueKey: 'wins',
    iconColumn: 1,
    badges: [
      { name: 'First Win', threshold: 3 },
      { name: 'Winner', threshold: 10 },
      { name: 'Champion', threshold: 25 },
      { name: 'Conqueror', threshold: 50 },
    ],
  },
  {
    label: 'Combat',
    valueKey: 'totalDamageDealt',
    iconColumn: 2,
    badges: [
      { name: 'Fighter', threshold: 5000 },
      { name: 'Striker', threshold: 15000 },
      { name: 'Destroyer', threshold: 30000 },
      { name: 'Warlord', threshold: 60000 },
    ],
  },
  {
    label: 'Survivor',
    valueKey: 'totalDamageReceived',
    iconColumn: 3,
    badges: [
      { name: 'Survivor', threshold: 1000 },
      { name: 'Tank', threshold: 5000 },
      { name: 'Fortress', threshold: 15000 },
      { name: 'Guardian', threshold: 30000 },
    ],
  },
  {
    label: 'Treasure',
    valueKey: 'totalGoldEarned',
    iconColumn: 4,
    badges: [
      { name: 'Collector', threshold: 1000 },
      { name: 'Hoarder', threshold: 5000 },
      { name: 'Tycoon', threshold: 15000 },
      { name: 'Golden King', threshold: 30000 },
    ],
  },
];

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
  const badges = BADGE_GROUPS.map(group => ({
    label: group.label,
    iconColumn: group.iconColumn,
    ...getCurrentBadge(stats[group.valueKey] ?? 0, group.badges),
  }));

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
