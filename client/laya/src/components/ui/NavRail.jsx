// components/navigation/NavRail.jsx
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Wordmark } from '@/components/ui/Wordmark.jsx';
import { useAuth } from '@/features/auth/context/AuthContext.jsx';
import { usePrefs } from '@/app/providers/PrefsContext.jsx';
import { useAddMusic } from '@/app/providers/AddMusicContext.jsx';
import { Sun, Moon, Search, List, Grid, LogOut, User, Plus } from 'lucide-react';

export function NavRail() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isListView, toggleListView } = usePrefs();
  const { openAddMusic } = useAddMusic();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Songs', path: '/songs' },
    { label: 'Playlists', path: '/playlists' },
    { label: 'Albums', path: '/albums' },
    { label: 'Library', path: '/library' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-14 glass-panel select-none px-5 md:px-8 flex items-center justify-between">
      {/* LEFT: Wordmark */}
      <div className="flex items-center gap-8">
        <Wordmark />

        {/* Primary nav links */}
        <nav className="hidden md:flex items-center gap-0.5 font-mono text-[11px]">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-md transition-all duration-200 ${
                  isActive
                    ? 'text-accent font-semibold bg-accent-soft'
                    : 'text-ink-soft hover:text-ink hover:bg-paper-2/60'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* RIGHT: Search, View Toggle, Theme, User */}
      <div className="flex items-center gap-1.5">
        {/* Add Music button */}
        <button
          onClick={openAddMusic}
          className="btn-primary !py-1.5 !px-3 !text-[10px] !rounded-md !gap-1.5"
          title="Add song or vinyl to collection"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Music</span>
        </button>

        {/* Search button */}
        <NavLink
          to="/search"
          className="p-2 text-ink-soft hover:text-ink hover:bg-paper-2/60 rounded-md transition-all duration-200 flex items-center gap-1.5 text-xs font-mono"
          title="Search catalogue"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline text-[11px]">Search</span>
        </NavLink>

        {/* List View Toggle (Accessible alternative to 2D canvas) */}
        <button
          onClick={toggleListView}
          className="p-2 text-ink-soft hover:text-ink hover:bg-paper-2/60 rounded-md transition-all duration-200 flex items-center gap-1 text-xs font-mono cursor-pointer"
          title="Toggle List view / Canvas (Key: L)"
        >
          {isListView ? (
            <>
              <Grid className="w-4 h-4 text-accent" />
              <span className="hidden lg:inline text-[11px]">Canvas</span>
            </>
          ) : (
            <>
              <List className="w-4 h-4" />
              <span className="hidden lg:inline text-[11px]">List</span>
            </>
          )}
        </button>

        {/* Theme Toggle (Warm / Night) */}
        <button
          onClick={toggleTheme}
          className="p-2 text-ink-soft hover:text-ink hover:bg-paper-2/60 rounded-md transition-all duration-200 cursor-pointer"
          title={`Switch to ${theme === 'warm' ? 'Night' : 'Warm'} theme`}
        >
          {theme === 'warm' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-accent" />}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-rule/40 mx-1" />

        {/* Account state */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent-soft border border-accent/20 flex items-center justify-center">
              <span className="text-[10px] font-serif font-bold text-accent">
                {(user.displayName || user.username || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-[11px] font-serif italic text-ink truncate max-w-[90px] hidden sm:block">
              {user.displayName || user.username}
            </span>
            <button
              onClick={() => logout()}
              className="p-1.5 text-ink-soft hover:text-danger hover:bg-danger/10 rounded-md transition-all duration-200 cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="btn-primary !py-1.5 !px-4 !text-[10px] !rounded-md"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
