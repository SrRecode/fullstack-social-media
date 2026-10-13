# Social Media App

A full-stack social media application built with React, Express, and MongoDB.

## Features

- Create, read, update, and delete posts
- Like/unlike posts
- Comment on posts
- User profiles with avatars
- Responsive modern UI

## Tech Stack

**Frontend:** React 18, Fetch API, CSS3
**Backend:** Node.js, Express, MongoDB, Mongoose

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI
npm install
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm start
```

The app will be available at `http://localhost:3000` (frontend) and `http://localhost:5000` (backend API).

## Project Structure

```
fullstack-social-media/
├── server/          # Express API
│   ├── config/      # Database configuration
│   ├── models/      # Mongoose models
│   ├── routes/      # API routes
│   └── controllers/ # Route handlers
└── client/          # React frontend
    ├── public/
    └── src/
        ├── components/  # React components
        └── styles/      # CSS styles
```

## API Endpoints

| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | /api/posts            | Get all posts        |
| POST   | /api/posts            | Create a post        |
| GET    | /api/posts/:id        | Get a single post    |
| PUT    | /api/posts/:id        | Update a post        |
| DELETE | /api/posts/:id        | Delete a post        |
| POST   | /api/posts/:id/like   | Like a post          |
| POST   | /api/posts/:id/unlike | Unlike a post        |
| GET    | /api/posts/:id/comments | Get post comments  |
| POST   | /api/posts/:id/comments | Add a comment      |
| DELETE | /api/comments/:id     | Delete a comment     |
| GET    | /api/users            | Get all users        |
| POST   | /api/users            | Create a user        |
| GET    | /api/users/:id        | Get a single user    |
| PUT    | /api/users/:id        | Update a user        |
| DELETE | /api/users/:id        | Delete a user        |
