import React from 'react';

function UserProfile({ user, posts }) {
  const userPosts = posts.filter(
    p => p.author?._id === user._id
  );
  const totalLikes = userPosts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);

  return (
    <div className="user-profile">
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="avatar" />
      ) : (
        <div className="avatar-placeholder">
          {user.name[0]?.toUpperCase()}
        </div>
      )}
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <div className="user-stats">
        <div className="stat">
          <div className="stat-value">{userPosts.length}</div>
          <div className="stat-label">Posts</div>
        </div>
        <div className="stat">
          <div className="stat-value">{totalLikes}</div>
          <div className="stat-label">Likes</div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
