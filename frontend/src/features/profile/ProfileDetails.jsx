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
        <dt>Role</dt>
        <dd>{profileUser.role || 'Not available'}</dd>
      </div>
    </dl>
  );
}
