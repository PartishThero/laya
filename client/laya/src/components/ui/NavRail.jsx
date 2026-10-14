// components/navigation/NavRail.jsx
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Wordmark } from '@/components/ui/Wordmark.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { usePrefs } from '@/app/providers/PrefsContext.jsx';
import { Sun, Moon, Search, List, Grid, LogOut, User } from 'lucide-react';

export function NavRail() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isListView, toggleListView } = usePrefs();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Songs', path: '/songs' },
    { label: 'Playlists', path: '/playlists' },
    { label: 'Albums', path: '/albums' },
    { label: 'Library', path: '/library' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-14 bg-paper/90 backdrop-blur-md border-b border-rule select-none px-4 md:px-8 flex items-center justify-between">
      {/* LEFT: Wordmark */}
      <div className="flex items-center gap-6">
        <Wordmark />

        {/* Primary nav links */}
        <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-sm transition-colors ${
                  isActive
                    ? 'text-accent font-semibold border-b-2 border-accent'
                    : 'text-ink-soft hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* RIGHT: Search, View Toggle, Theme, User */}
      <div className="flex items-center gap-3">
        {/* Search button */}
        <NavLink
          to="/search"
          className="p-1.5 text-ink-soft hover:text-ink rounded-xs transition-colors flex items-center gap-1.5 text-xs font-mono"
          title="Search catalogue"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
        </NavLink>

        {/* List View Toggle (Accessible alternative to 2D canvas) */}
        <button
          onClick={toggleListView}
          className="p-1.5 text-ink-soft hover:text-ink rounded-xs transition-colors flex items-center gap-1 text-xs font-mono cursor-pointer"
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
          className="p-1.5 text-ink-soft hover:text-ink rounded-xs transition-colors cursor-pointer"
          title={`Switch to ${theme === 'warm' ? 'Night' : 'Warm'} theme`}
        >
          {theme === 'warm' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-accent" />}
        </button>

        {/* Account state */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2 pl-2 border-l border-rule/50">
            <span className="text-xs font-serif italic text-ink truncate max-w-[100px]">
              {user.displayName || user.username}
            </span>
            <button
              onClick={() => logout()}
              className="p-1 text-ink-soft hover:text-danger cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-2 border-l border-rule/50">
            <Link
              to="/login"
              className="text-xs font-mono px-3 py-1 bg-ink text-paper rounded-xs hover:bg-accent transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
