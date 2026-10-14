// app/providers/AddMusicContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const AddMusicContext = createContext(null);

export function AddMusicProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openAddMusic = useCallback(() => setIsOpen(true), []);
  const closeAddMusic = useCallback(() => setIsOpen(false), []);

  return (
    <AddMusicContext.Provider value={{ isOpen, openAddMusic, closeAddMusic }}>
      {children}
    </AddMusicContext.Provider>
  );
}

export function useAddMusic() {
  const ctx = useContext(AddMusicContext);
  if (!ctx) throw new Error('useAddMusic must be used within an AddMusicProvider');
  return ctx;
}
