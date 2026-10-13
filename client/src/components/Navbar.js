import React from 'react';

function Navbar({ currentUser, users, onUserChange, view, setView }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => setView('feed')}>
        SocialApp
      </div>
      <div className="navbar-actions">
        {users.length > 0 && (
          <select
            value={currentUser?._id || ''}
            onChange={(e) => {
              const user = users.find(u => u._id === e.target.value);
              if (user) onUserChange(user);
            }}
          >
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
        )}
        <button
          className="navbar-profile-btn"
          onClick={() => setView(view === 'profile' ? 'feed' : 'profile')}
        >
          {view === 'profile' ? 'Back to Feed' : 'Profile'}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
