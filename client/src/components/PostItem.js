import React from 'react';
import CommentSection from './CommentSection';

function PostItem({ post, currentUser, onDelete, onToggleLike }) {
  const isLiked = currentUser && post.likes.some(l => l._id === currentUser._id);
  const isOwner = currentUser && post.author?._id === currentUser._id;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now - date) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return date.toLocaleDateString();
  };

  return (
    <article className="post-item">
      <div className="post-header">
        {post.author?.avatar ? (
          <img src={post.author.avatar} alt={post.author.name} className="avatar" />
        ) : (
          <div className="avatar-placeholder">
            {post.author?.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div className="post-author-info">
          <div className="post-author-name">{post.author?.name}</div>
          <div className="post-time">{formatDate(post.createdAt)}</div>
        </div>
        {isOwner && (
          <button className="post-delete-btn" onClick={() => onDelete(post._id)}>
            &#x2715;
          </button>
        )}
      </div>
      <div className="post-content">{post.content}</div>
      <div className="post-actions">
        <button
          className={`post-action-btn ${isLiked ? 'liked' : ''}`}
          onClick={() => onToggleLike(post._id)}
        >
          {isLiked ? '&#x2764;' : '&#x2661;'} {post.likes.length}
        </button>
        <span className="post-action-btn">
          &#x1f4ac; {post.commentCount || 0}
        </span>
      </div>
      <CommentSection post={post} currentUser={currentUser} />
    </article>
  );
}

export default PostItem;
