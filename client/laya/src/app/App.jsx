// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context/AuthContext.jsx';
import { PrefsProvider } from '@/app/providers/PrefsContext.jsx';
import { ToastProvider } from '@/app/providers/ToastContext.jsx';
import { QueueProvider } from '@/features/player/context/QueueContext.jsx';
import { PlayerProvider } from '@/features/player/context/PlayerContext.jsx';
import { DragProvider } from '@/app/providers/DragContext.jsx';
import { AddMusicProvider } from '@/app/providers/AddMusicContext.jsx';
import { AppShell } from '@/app/AppShell.jsx';

import Home from '@/features/library/pages/Home.jsx';
import Songs from '@/features/library/pages/Songs.jsx';
import Playlists from '@/features/library/pages/Playlists.jsx';
import Playlist from '@/features/library/pages/Playlist.jsx';
import Albums from '@/features/library/pages/Albums.jsx';
import Album from '@/features/library/pages/Album.jsx';
import Artist from '@/features/library/pages/Artist.jsx';
import Search from '@/features/search/pages/Search.jsx';
import Library from '@/features/library/pages/Library.jsx';
import LikedSongs from '@/features/library/pages/LikedSongs.jsx';
import Login from '@/features/auth/pages/Login.jsx';
import Signup from '@/features/auth/pages/Signup.jsx';

export default function App() {
  return (
    <AuthProvider>
      <PrefsProvider>
        <ToastProvider>
          <QueueProvider>
            <PlayerProvider>
              <DragProvider>
                <AddMusicProvider>
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
                </AddMusicProvider>
              </DragProvider>
            </PlayerProvider>
          </QueueProvider>
        </ToastProvider>
      </PrefsProvider>
    </AuthProvider>
  );
}