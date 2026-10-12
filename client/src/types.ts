export type User = {
  id: string
  name: string
  handle: string
  bio: string
  location: string
  avatar: string
  color: string
  following: string[]
}

export type Comment = {
  id: string
  userId: string
  text: string
  createdAt: string
}

export type Post = {
  id: string
  userId: string
  text: string
  image?: string
  createdAt: string
  likes: string[]
  comments: Comment[]
}

export type Bootstrap = {
  currentUser: User
  users: User[]
  posts: Post[]
}
