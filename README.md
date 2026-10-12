# Circles

Circles is a small, full-stack social app for sharing everyday thoughts and finding a welcoming community. It is designed as a fully runnable local demo: a responsive React interface talks to an Express API, and user actions persist to a local JSON file.

## What you can do

- Browse a seeded community feed or limit the feed to people you follow.
- Create text posts, react with likes, and add replies.
- Explore community profiles, search posts and people by name, handle, bio, or location, follow and unfollow others, and view profile timelines.
- Share a post with a permalink that scrolls to and highlights the original post when opened.
- Switch between five seeded demo identities from the profile selector on any screen.
- Sort posts by the curated feed order or most recent activity.

## Requirements

- Node.js 20 or later (npm workspaces are used).
- npm 10 or later.

## Start locally

```sh
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://127.0.0.1:5173`). The API runs on `http://127.0.0.1:4000` and Vite proxies `/api` requests to it. The first API write creates `server/data/social.json`; seed content is loaded automatically when the file does not exist.

To make a production client bundle and run the API separately:

```sh
npm run build
npm start
```

The production API does not serve the client bundle; use a static web host or reverse proxy to publish `client/dist` and route `/api` to the API.

## Configuration

Copy `.env.example` to `.env` if you want a reminder of supported settings. Node does not load `.env` automatically; provide variables through your shell or process manager:

| Variable | Default | Description |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | API bind address. Keep loopback for local-only use. |
| `PORT` | `4000` | API listen port. |
| `DATABASE_PATH` | `server/data/social.json` | Location for the persistent JSON store; relative paths resolve from the server process working directory. |

Example in PowerShell:

```powershell
$env:PORT = "4001"
npm run dev
```

If you change the API port, also update the proxy target in `client/vite.config.ts`.

## Project structure

```text
client/
  src/App.tsx          Feed, navigation, profiles, interactions, loading and error states
  src/api.ts           Typed fetch wrapper for the API
  src/styles.css       Responsive visual system and reduced-motion support
  vite.config.ts       Local development server and API proxy
server/
  src/app.js           Express API routes and request validation
  src/data.js          Seed community identities and example posts
  src/store.js         Serialized, atomic JSON persistence and data operations
  src/index.js         API process entry point
  test/app.test.js     API integration tests
```

## API overview

All application requests use the `X-Demo-User` header to select a seeded local identity. The API provides:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness check; no identity required |
| `GET` | `/api/bootstrap` | Current profile, community profiles, and feed |
| `POST` | `/api/posts` | Create a text post (1–500 characters) |
| `POST` | `/api/posts/:postId/like` | Toggle the current demo user's reaction |
| `POST` | `/api/posts/:postId/comments` | Add a reply (1–280 characters) |
| `POST` | `/api/users/:targetId/follow` | Toggle following a community profile |

The data model has users (`id`, display name, handle, profile details, following IDs) and posts (`id`, author ID, text, creation timestamp, liked user IDs, and comments). A comment stores its ID, author, text, and timestamp.

## Tests and checks

```sh
npm test
npm run typecheck
npm run build
```

The API tests use Node's built-in test runner and temporary data files; they exercise identity checks, seeded bootstrap data, validation, persistence, likes, replies, follows, and not-found cases.

## Demo security and limitations

This project deliberately has **no real accounts, passwords, sessions, or authentication**. `X-Demo-User` is a convenience for switching among hard-coded sample personas and is not proof of identity. Anyone who can reach the API can impersonate any seeded profile. Do not expose the demo API to the public internet, put private data in it, or reuse it as production authentication.

The JSON store is intended for a single local server process and a small demo dataset; it is not a concurrent multi-instance database, and the app does not include image uploads, moderation tooling, notifications, password recovery, or production deployment hardening. Profile avatars are illustrative remote sample images, so displaying them requires internet access. Community posts and follows are intentionally friendly seed data.
