// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { PrefsProvider } from './context/PrefsContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { QueueProvider } from './context/QueueContext.jsx';
import { PlayerProvider } from './context/PlayerContext.jsx';
import { DragProvider } from './context/DragContext.jsx';
import { AppShell } from './components/layout/AppShell.jsx';

import Home from './pages/Home.jsx';
import Songs from './pages/Songs.jsx';
import Playlists from './pages/Playlists.jsx';
import Playlist from './pages/Playlist.jsx';
import Albums from './pages/Albums.jsx';
import Album from './pages/Album.jsx';
import Artist from './pages/Artist.jsx';
import Search from './pages/Search.jsx';
import Library from './pages/Library.jsx';
import LikedSongs from './pages/LikedSongs.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';

export default function App() {
  return (
    <AuthProvider>
      <PrefsProvider>
        <ToastProvider>
          <QueueProvider>
            <PlayerProvider>
              <DragProvider>
                <BrowserRouter>
                  <AppShell>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/songs" element={<Songs />} />
                      <Route path="/playlists" element={<Playlists />} />
                      <Route path="/playlists/:id" element={<Playlist />} />
                      <Route path="/albums" element={<Albums />} />
                      <Route path="/albums/:id" element={<Album />} />
                      <Route path="/artists/:id" element={<Artist />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/library" element={<Library />} />
                      <Route path="/liked" element={<LikedSongs />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                    </Routes>
                  </AppShell>
                </BrowserRouter>
              </DragProvider>
            </PlayerProvider>
          </QueueProvider>
        </ToastProvider>
      </PrefsProvider>
    </AuthProvider>
  );
}