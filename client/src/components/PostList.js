import React from 'react';
import PostItem from './PostItem';

function PostList({ posts, currentUser, onDelete, onToggleLike }) {
  if (posts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray)' }}>
        <p>No posts yet. Be the first to post!</p>
      </div>
    );
  }

  return (
    <div className="post-list">
      {posts.map(post => (
        <PostItem
          key={post._id}
          post={post}
          currentUser={currentUser}
          onDelete={onDelete}
          onToggleLike={onToggleLike}
        />
      ))}
    </div>
  );
}

export default PostList;
