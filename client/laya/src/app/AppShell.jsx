// components/layout/AppShell.jsx
import React from 'react';
import { NavRail } from '@/components/ui/NavRail.jsx';
import { NowPlayingZone } from '@/features/player/components/NowPlayingZone.jsx';
import { PlaylistDock } from '@/features/library/components/PlaylistDock.jsx';
import { DragLayer } from '@/components/drag/DragLayer.jsx';
import { FirstVisitHint } from '@/components/ui/FirstVisitHint.jsx';

export function AppShell({ children }) {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-paper text-ink">
      {/* Procedural analog paper grain overlay */}
      <div className="grain-overlay pointer-events-none" />

      {/* Chrome Navigation */}
      <NavRail />

      {/* Main View Area */}
      <main className="w-full h-full">
        {children}
      </main>

      {/* Fixed Interactive Layers */}
      <PlaylistDock />
      <NowPlayingZone />
      <DragLayer />
      <FirstVisitHint />
    </div>
  );
}
