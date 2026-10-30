# Laya

An infinite spatial canvas for your music library, built around the tactile feel of physical records and analog playback.

Instead of scrolling through standard playlist tables and algorithmic feeds, Laya lays your albums and tracks out on an open 2D canvas that you can pan, zoom, organize, and listen to directly.

---

## Video Demo

A video demonstration of Laya is available on Google Drive:

- [Laya Video Demo](https://drive.google.com/drive/folders/1Z0ogMhcYLjg2klp8MNJulyohOXqqD4Qb?usp=sharing)

---

## Features

- **Infinite Canvas**: Pan and zoom freely across your records, vinyl sleeves, and tracks.
- **Analog Aesthetic**: Warm, tactile visual design inspired by physical turntables and record sleeves.
- **Range-Based Audio Streaming**: Custom stream endpoint with HTTP 206 support for instant seeking and scrubbing.
- **Crates & Playlists**: Group records into crates, custom playlists, or your personal collection.
- **Standalone Backend**: Independent Express and MongoDB backend with no third-party platform lock-in.
- **MediaSession Integration**: Native OS media controls, lock screen metadata, and keyboard playback shortcuts.

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide icons
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Deployment**: Configured for Vercel multi-service architecture (`vercel.json`)

---

## Quickstart

### Prerequisites
- Node.js 18+
- A running MongoDB instance (local or MongoDB Atlas)

### 1. Clone & Install

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client/laya
npm install
```

### 2. Environment Variables

Create a `.env` file in `server/`:

```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/laya
AUTH_SECRET=your_jwt_secret
CLIENT_ORIGIN=http://localhost:5173
```

*(Optional)* In `client/laya/.env`:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

### 3. Seed Sample Data (Optional)

To populate the canvas with sample artists, albums, and tracks:

```bash
cd server
npm run seed
```

To wipe the collection clean at any point:
```bash
npm run clear-data
```

### 4. Run Locally

Start both servers in separate terminal tabs:

```bash
# Terminal 1 — Backend (http://localhost:5001)
cd server
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd client/laya
npm run dev
```

---

## Project Structure

```
laya/
├── client/laya/         # React 19 frontend
│   └── src/
│       ├── app/         # Shell and context providers
│       ├── features/    # Canvas, audio player, library, auth
│       ├── lib/audio/   # Audio playback engine
│       └── services/    # Backend API client
├── server/              # Express REST API
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── models/      # Mongoose schemas (Song, Album, Artist, User)
│   │   └── routes/      # API routes
│   └── scripts/         # Seed and cleanup scripts
└── vercel.json          # Multi-service deployment config
```

---

## API Overview

All backend endpoints are prefixed with `/api`:

| Resource | Route | Purpose |
| :--- | :--- | :--- |
| **Auth** | `/api/auth/*` | Register, login, session validation (`/me`), logout |
| **Songs** | `/api/songs` | List songs, upload tracks, range audio streaming (`/:id/stream`) |
| **Discover** | `/api/discover` | Spatial chunk queries for canvas loading |
| **Artists** | `/api/artists/*` | Artist profiles and discographies |
| **Albums** | `/api/albums/*` | Album sleeves and ordered tracklists |
| **Playlists** | `/api/playlists/*` | Crates and playlist CRUD operations |
| **Users** | `/api/users/me/*` | Liked tracks, listening history, and user playlists |
| **Search** | `/api/search` | Global search across songs, albums, and artists |

---

## License

MIT
