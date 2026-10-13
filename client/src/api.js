const API_BASE = '/api';

export const fetchPosts = async () => {
  const response = await fetch(`${API_BASE}/posts`);
  return response.json();
};

export const fetchPost = async (id) => {
  const response = await fetch(`${API_BASE}/posts/${id}`);
  return response.json();
};

export const createPost = async (postData) => {
  const response = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  });
  return response.json();
};

export const updatePost = async (id, postData) => {
  const response = await fetch(`${API_BASE}/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  });
  return response.json();
};

export const deletePost = async (id) => {
  const response = await fetch(`${API_BASE}/posts/${id}`, {
    method: 'DELETE'
  });
  return response.json();
};

export const likePost = async (id, userId) => {
  const response = await fetch(`${API_BASE}/posts/${id}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  return response.json();
};

export const unlikePost = async (id, userId) => {
  const response = await fetch(`${API_BASE}/posts/${id}/unlike`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  return response.json();
};

export const fetchComments = async (postId) => {
  const response = await fetch(`${API_BASE}/posts/${postId}/comments`);
  return response.json();
};

export const createComment = async (postId, commentData) => {
  const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(commentData)
  });
  return response.json();
};

export const deleteComment = async (id) => {
  const response = await fetch(`${API_BASE}/comments/${id}`, {
    method: 'DELETE'
  });
  return response.json();
};

export const fetchUsers = async () => {
  const response = await fetch(`${API_BASE}/users`);
  return response.json();
};

export const fetchUser = async (id) => {
  const response = await fetch(`${API_BASE}/users/${id}`);
  return response.json();
};

export const createUser = async (userData) => {
  const response = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};

export const updateUser = async (id, userData) => {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};

export const deleteUser = async (id) => {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE'
  });
  return response.json();
};
