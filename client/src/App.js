import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PostList from './components/PostList';
import PostForm from './components/PostForm';
import UserProfile from './components/UserProfile';
import { fetchUsers } from './api';

function App() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('feed');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
    loadPosts();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
      if (data.length > 0 && !currentUser) {
        setCurrentUser(data[0]);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPost = (post) => {
    setPosts([post, ...posts]);
  };

  const deletePost = async (postId) => {
    try {
      await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      setPosts(posts.filter(p => p._id !== postId));
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const toggleLike = async (postId) => {
    if (!currentUser) return;
    const post = posts.find(p => p._id === postId);
    const isLiked = post.likes.some(l => l._id === currentUser._id);
    try {
      const response = await fetch(`/api/posts/${postId}/${isLiked ? 'unlike' : 'like'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser._id })
      });
      const updatedPost = await response.json();
      setPosts(posts.map(p => p._id === postId ? updatedPost : p));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="app">
      <Navbar
        currentUser={currentUser}
        users={users}
        onUserChange={setCurrentUser}
        view={view}
        setView={setView}
      />
      <main className="main-content">
        {view === 'feed' && (
          <>
            <PostForm currentUser={currentUser} onPostCreated={addPost} />
            <PostList
              posts={posts}
              currentUser={currentUser}
              onDelete={deletePost}
              onToggleLike={toggleLike}
            />
          </>
        )}
        {view === 'profile' && currentUser && (
          <UserProfile user={currentUser} posts={posts} />
        )}
      </main>
    </div>
  );
}

export default App;
