import React, { useState, useEffect } from 'react';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

function CommentSection({ post, currentUser }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    loadComments();
  }, [post._id]);

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/posts/${post._id}/comments`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const addComment = (comment) => {
    setComments([comment, ...comments]);
  };

  const removeComment = (commentId) => {
    setComments(comments.filter(c => c._id !== commentId));
  };

  return (
    <div className="comment-section">
      <CommentForm postId={post._id} currentUser={currentUser} onCommentAdded={addComment} />
      <div className="comment-list">
        {comments.map(comment => (
          <CommentItem
            key={comment._id}
            comment={comment}
            currentUser={currentUser}
            onDelete={removeComment}
          />
        ))}
      </div>
    </div>
  );
}

export default CommentSection;
