// components/zones/RoamingZone.jsx
import React, { useState, useEffect } from 'react';
import { roamingZoneEngine } from '../../engines/roaming/roamingZone.js';
import { useDropZone } from '../../hooks/useDropZone.js';
import { playlistsApi } from '../../services/api/playlists.api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '@/app/providers/ToastContext.jsx';
import { ZoneStamp } from '@/components/ui/ZoneStamp.jsx';
import { Compass, Sparkles } from 'lucide-react';

export function RoamingZone({ viewport }) {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [playlist, setPlaylist] = useState(null);
  const [stamp, setStamp] = useState('idle');
  const [pos, setPos] = useState(roamingZoneEngine.position);
  const [showBearing, setShowBearing] = useState(false);

  useEffect(() => {
    // Fetch a public playlist or user's playlist to attach to roaming tray
    if (isAuthenticated) {
      playlistsApi.getMyPlaylists()
        .then(pls => {
          if (pls.length > 0) setPlaylist(pls[0]);
        })
        .catch(() => {});
    } else {
      playlistsApi.getPublicPlaylists()
        .then(pls => {
          if (pls.length > 0) setPlaylist(pls[0]);
        })
        .catch(() => {});
    }

    // Check hint timer periodically
    const timer = setInterval(() => {
      if (roamingZoneEngine.shouldShowHint()) {
        setShowBearing(true);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [isAuthenticated]);

  const { zoneRef, isOver, isNear } = useDropZone({
    id: 'roaming-zone-crate',
    type: 'playlist',
    payload: {
      playlistId: playlist?._id || playlist?.id || 'roaming-fallback',
      playlistName: playlist?.name || 'Roaming Crate',
      onSuccess: () => {
        setStamp('confirmed');
        addToast('Found and filled the wandering crate!', 'success');
        setTimeout(() => {
          setStamp('idle');
          // Relocate to a new random location
          const nextPos = roamingZoneEngine.relocate(viewport);
          setPos({ ...nextPos });
          setShowBearing(false);
        }, 2000);
      }
    }
  });

  // Calculate bearing angle to roaming zone
  const bearingAngle = roamingZoneEngine.getBearingAngle(
    viewport,
    window.innerWidth,
    window.innerHeight
  );

  return (
    <>
      {/* The physical world object crate on canvas plane */}
      <div
        ref={zoneRef}
        className={`absolute pointer-events-auto p-4 rounded-sm border-2 select-none transition-all duration-300 w-64 bg-paper-2 shadow-xl ${
          isOver
            ? 'border-accent bg-paper scale-105 shadow-2xl'
            : isNear
            ? 'border-accent/80'
            : 'border-dashed border-ink/40'
        }`}
        style={{
          transform: `translate3d(${pos.worldX}px, ${pos.worldY}px, 0)`,
          zIndex: 50
        }}
      >
        <div className="flex items-center justify-between border-b border-rule/60 pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="font-serif italic text-xs font-semibold text-ink">
              Wandering Crate
            </span>
          </div>
          <span className="text-[9px] font-mono text-ink-faint uppercase">
            FOUND
          </span>
        </div>

        <p className="font-serif text-sm font-medium text-ink leading-tight">
          {playlist ? playlist.name : 'Curator Archive'}
        </p>
        <p className="text-[11px] font-sans text-ink-soft mt-1">
          Drop any discovered record into this crate to file it away.
        </p>

        {stamp !== 'idle' && (
          <div className="mt-3">
            <ZoneStamp status={stamp} />
          </div>
        )}
      </div>

      {/* Screen edge bearing mark safeguard if roaming zone is unfound after 60s */}
      {showBearing && (
        <div
          className="fixed z-[150] pointer-events-none flex items-center gap-1.5 px-2.5 py-1 bg-paper/90 border border-accent/60 text-accent text-[10px] font-mono rounded-full shadow-md animate-pulse"
          style={{
            top: '50%',
            right: '24px',
            transform: 'translateY(-50%)'
          }}
        >
          <Compass className="w-3.5 h-3.5" style={{ transform: `rotate(${bearingAngle}rad)` }} />
          <span>CRATE DRIFTING THIS WAY</span>
        </div>
      )}
    </>
  );
}
