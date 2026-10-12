import type { Bootstrap, Post } from './types'

async function request<T>(path: string, userId: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Demo-User': userId,
      ...options.headers,
    },
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error ?? 'Something went wrong. Please try again.')
  return result as T
}

export const api = {
  bootstrap: (userId: string) => request<Bootstrap>(`/bootstrap`, userId),
  createPost: (userId: string, text: string) =>
    request<Post>('/posts', userId, { method: 'POST', body: JSON.stringify({ text }) }),
  toggleLike: (userId: string, postId: string) =>
    request<{ liked: boolean; likes: string[] }>(`/posts/${postId}/like`, userId, { method: 'POST' }),
  addComment: (userId: string, postId: string, text: string) =>
    request<Post>(`/posts/${postId}/comments`, userId, { method: 'POST', body: JSON.stringify({ text }) }),
  toggleFollow: (userId: string, targetId: string) =>
    request<{ following: boolean }>(`/users/${targetId}/follow`, userId, { method: 'POST' }),
}
