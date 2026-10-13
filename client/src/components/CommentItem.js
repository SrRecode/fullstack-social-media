import React from 'react';

function CommentItem({ comment, currentUser, onDelete }) {
  const isOwner = currentUser && comment.author?._id === currentUser._id;

  return (
    <div className="comment-item">
      <div className="comment-avatar">
        {comment.author?.name?.[0]?.toUpperCase()}
      </div>
      <div className="comment-body">
        <span className="comment-author">{comment.author?.name}</span>
        <div className="comment-text">{comment.content}</div>
      </div>
      {isOwner && (
        <button className="comment-delete-btn" onClick={() => onDelete(comment._id)}>
          &#x2715;
        </button>
      )}
    </div>
  );
}

export default CommentItem;
