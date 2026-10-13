import React, { useState } from 'react';

function CommentForm({ postId, currentUser, onCommentAdded }) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !currentUser || submitting) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: currentUser._id, content: content.trim() })
      });
      const comment = await response.json();
      onCommentAdded(comment);
      setContent('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={300}
        disabled={!currentUser}
      />
      <button type="submit" disabled={!content.trim() || !currentUser || submitting}>
        Reply
      </button>
    </form>
  );
}

export default CommentForm;
