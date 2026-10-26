# Laya Backend Server & REST API

Independent, self-hosted Node.js / Express / MongoDB REST API backend for the Laya music platform.

---

## Architecture

- **`src/app.js`**: Express application setup, CORS configuration, JSON body parsing, upload static file serving, and route registration.
- **`src/server.js`**: HTTP server entrypoint listening on port `5001`.
- **`src/config/db.js`**: Mongoose connection to MongoDB.
- **`src/models/`**:
  - `Song.js`: Track metadata, duration, genres, attribution, audio URL, cover artwork URL.
  - `Album.js`: Album title, release date, artist reference, track references.
  - `Artist.js`: Name, biography, genre tags, profile image.
  - `User.js`: User accounts, bcrypt password hash, liked songs list.
  - `Playlist.js`: User-curated playlists and track order.
  - `ListeningEvent.js`: Playback telemetry and user history.
- **`src/controllers/`**: Controller implementations for auth, songs, albums, artists, playlists, users, search, and spatial discovery.
- **`src/middleware/`**:
  - `authMiddleware.js`: JWT validation and user resolution.
  - `uploadMiddleware.js`: Multer file filter and storage configuration for local audio files and cover art.
  - `errorMiddleware.js`: Centralized error handling.
- **`scripts/`**:
  - `seedCatalogue.js`: Populates database with sample artists, albums, songs, and playlists.
  - `clearAllData.js`: Purges all music collection records.

---

## Scripts

```bash
# Run server in production mode
npm start

# Run server with live nodemon reload
npm run dev

# Seed rich sample music catalogue into MongoDB
npm run seed

# Clear all music and catalogue data from MongoDB
npm run clear-data
```

---

## Environment Variables (`.env`)

```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/laya?retryWrites=true&w=majority
AUTH_SECRET=your_jwt_secret_key_here
CLIENT_ORIGIN=http://localhost:5173
```
