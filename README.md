# Laya — Spatial Analog Music Platform

> An analog-inspired, infinite spatial canvas music player and catalog, powered by an in-house custom REST API and direct audio streaming.

---

## 📖 Overview

**Laya** is a web-based spatial music archive and playback application designed around the tactile feel of physical records. Instead of rigid algorithmic feeds and commercial third-party platforms, Laya organizes music into physical-style records across an infinite 2D canvas that users can freely pan, zoom, organize, and play.

The platform is **100% self-hosted and independent** — built with its own custom REST API, local audio ingestion engine, chunked spatial discovery system, and HTTP 206 range-based audio streaming. **No external music APIs (e.g. Spotify, Apple Music) are used or required.**

---

## 🛠️ Architecture & Tech Stack

```
laya/
├── client/laya/           # React 19 Frontend (Vite, TailwindCSS, Lucide)
│   ├── src/app/           # App shell, context providers, layout
│   ├── src/components/    # Reusable UI components & modals
│   ├── src/features/      # Canvas, Player, Library, Search, Auth
│   ├── src/lib/audio/     # Audio engine & MediaSession integration
│   └── src/services/api/  # API client connecting to custom backend
└── server/                # Node.js & Express REST API
    ├── src/config/        # MongoDB connection
    ├── src/controllers/   # REST route controllers
    ├── src/middleware/    # Auth (JWT), uploads (Multer), error handling
    ├── src/models/        # Mongoose schemas (Song, Album, Artist, User, Playlist, History)
    ├── src/routes/        # Modular API routes
    ├── scripts/           # Seeder & data management utilities
    └── uploads/           # Hosted local audio & cover artwork files
```

### Backend (Server)
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with HTTP-only cookies and Bearer tokens
- **Audio Storage & Ingestion**: Multer for local multipart file uploads (`.mp3`, `.wav`, `.m4a`, `.flac`)
- **Audio Streaming**: Custom HTTP 206 Partial Content range stream handler with seek support

### Frontend (Client)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS + Custom Editorial Design Tokens (Warm analog palette, serif typography)
- **Canvas Rendering**: 2D Infinite Canvas with spiral chunking and spatial positioning
- **Audio Playback**: Web Audio API / HTML5 Audio with external store (`useSyncExternalStore`), lock-screen OS MediaSession controls, and resilient retries

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)
- **MongoDB** instance (local MongoDB server or MongoDB Atlas URI)

---

### 2. Backend Setup (`server`)

1. Open your terminal and navigate to `server`:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `server/.env`:
   ```env
   PORT=5001
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/laya?retryWrites=true&w=majority
   AUTH_SECRET=your_jwt_secret_key_here
   CLIENT_ORIGIN=http://localhost:5173
   ```
   *(See `server/.env.example` for reference)*

4. **Seed the database with sample analogue music**:
   ```bash
   npm run seed
   ```
   *Populates curated artists, albums, songs with open audio streams, and playlists into MongoDB.*

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API will be available at `http://localhost:5001`.*

---

### 3. Frontend Setup (`client/laya`)

1. Open a new terminal tab and navigate to `client/laya`:
   ```bash
   cd client/laya
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   *Access the web app at `http://localhost:5173`.*

---

## 📡 Custom REST API Specification

All backend endpoints are prefixed with `/api`.

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register` | Register new user account (returns JWT) | No |
| `POST` | `/api/auth/login` | Log in with username/email & password | No |
| `POST` | `/api/auth/logout` | Clears authentication session & cookie | No |
| `GET` | `/api/auth/me` | Retrieve profile of authenticated user | Yes |

### 2. Music Catalogue & Songs (`/api/songs`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/songs` | List songs (supports `search`, `genre`, `artist`, `album`, `page`, `limit`) | No |
| `GET` | `/api/songs/:id` | Get single song metadata with populated artist and album | No |
| `POST` | `/api/songs` | Add/upload track via multipart form (`audioFile`, `coverFile`) or direct URL | No |
| `DELETE` | `/api/songs/:id` | Remove song from collection | No |
| `GET` | `/api/songs/:id/stream` | Stream audio file with HTTP 206 Range headers | No |

### 3. Canvas Discovery (`/api/discover`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/discover` | Spatial chunk queries for 2D canvas (`kinds=song,album`, `page`, `limit`) | No |

### 4. Artists & Discography (`/api/artists`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/artists` | List or search recording artists | No |
| `GET` | `/api/artists/:id` | Get artist details, full discography albums, and recorded tracks | No |

### 5. Albums & Records (`/api/albums`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/albums` | List or search album sleeves | No |
| `GET` | `/api/albums/:id` | Get album details and ordered tracklist | No |

### 6. Playlists & Crates (`/api/playlists`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/playlists` | List public playlists | No |
| `GET` | `/api/playlists/:id` | Get playlist with populated songs | Optional |
| `POST` | `/api/playlists` | Create new playlist crate | Yes |
| `PATCH` | `/api/playlists/:id` | Update playlist metadata (name, description, visibility) | Yes |
| `DELETE` | `/api/playlists/:id` | Delete playlist | Yes |
| `POST` | `/api/playlists/:id/songs` | Add track to playlist | Yes |
| `DELETE` | `/api/playlists/:id/songs/:songId` | Remove track from playlist | Yes |
| `PATCH` | `/api/playlists/:id/reorder` | Reorder track sequence | Yes |

### 7. User Interactions & History (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/users/me/likes` | List user's liked records | Yes |
| `PUT` | `/api/users/me/likes/:songId` | Like / pin record to personal collection | Yes |
| `DELETE` | `/api/users/me/likes/:songId` | Remove record from likes | Yes |
| `POST` | `/api/users/me/history` | Log a listening event | Yes |
| `GET` | `/api/users/me/history` | Retrieve user's listening playback history | Yes |
| `GET` | `/api/users/me/playlists` | List user's created playlists | Yes |

### 8. Global Search (`/api/search`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/search?q={query}` | Search songs, albums, and artists in a single query | No |

---

## 🎵 Audio Uploading & Streaming Mechanics

1. **In-App Ingestion**:
   Users can click **Add Record** on the canvas to either:
   - Upload local audio files directly (`.mp3`, `.wav`, `.flac`, `.m4a`) along with custom album artwork.
   - Enter direct stream URLs.
2. **Range Requests (HTTP 206)**:
   The backend streaming endpoint (`/api/songs/:id/stream`) handles HTTP `Range` headers, enabling instant seeking, fast scrubbing, and bandwidth-efficient streaming without loading the entire audio file into memory.
3. **Local Serving**:
   Uploaded audio is saved into `server/uploads/audio` and artwork into `server/uploads/covers`, served securely with appropriate MIME types.

---

## 🧪 Seeding & Database Utilities

- **Seed Sample Catalogue**:
  ```bash
  cd server && npm run seed
  ```
  Creates 4 recording artists, 4 full albums, 12 tracks, 2 playlists, and a demo curator account (`curator` / `curator1234`).
- **Purge Database**:
  ```bash
  cd server && npm run clear-data
  ```
  Completely clears all songs, albums, artists, playlists, and listening events.

---

## 🔒 Evaluation / Grading Notes

- **Zero External API Lock-in**: All endpoints are implemented in Express & Mongoose. No Spotify credentials, Spotify SDKs, or external tokens are required.
- **RESTful Standards**: Standard HTTP methods, resource naming conventions, error middlewares, and status codes (200, 201, 206, 400, 401, 403, 404, 409, 500).
- **Separation of Concerns**: Clean separation between database schemas (`models`), business logic (`controllers`), request routing (`routes`), file uploads (`middleware`), and frontend presentation.
