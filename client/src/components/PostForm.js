import React, { useState } from 'react';

function PostForm({ currentUser, onPostCreated }) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !currentUser || submitting) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: currentUser._id, content: content.trim() })
      });
      const post = await response.json();
      onPostCreated(post);
      setContent('');
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const charCount = content.length;
  const maxChars = 500;

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <textarea
        placeholder="What's happening?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={maxChars}
        disabled={!currentUser}
      />
      <div className="post-form-footer">
        <span className="char-count">{charCount}/{maxChars}</span>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!content.trim() || !currentUser || submitting}
        >
          Post
        </button>
      </div>
    </form>
  );
}

export default PostForm;
