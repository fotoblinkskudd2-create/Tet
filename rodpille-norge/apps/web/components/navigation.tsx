'use client'

import Link from 'next/link'
import { useAuth } from '@/app/providers'
import { useState } from 'react'
import {
  Menu,
  X,
  Home,
  PlusCircle,
  Bell,
  User,
  LogOut,
  Search,
  Flame,
} from 'lucide-react'

export function Navigation() {
  const { user, signOut, isLoading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-pille-bg/95 backdrop-blur border-b border-pille-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rod-500 rounded flex items-center justify-center">
              <span className="font-black text-white">RP</span>
            </div>
            <span className="font-black text-xl tracking-tight hidden sm:block">
              RØD<span className="text-rod-500">PILLE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-pille-muted hover:text-white transition-colors">
              <Home size={18} />
              <span>Feed</span>
            </Link>
            <Link href="/trending" className="flex items-center gap-2 text-pille-muted hover:text-white transition-colors">
              <Flame size={18} />
              <span>Trending</span>
            </Link>
            {user && (
              <Link href="/create" className="flex items-center gap-2 text-rod-400 hover:text-rod-300 transition-colors">
                <PlusCircle size={18} />
                <span>Post</span>
              </Link>
            )}
          </div>

          {/* Search & Auth */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-pille-muted hover:text-white transition-colors"
            >
              <Search size={20} />
            </button>

            {isLoading ? (
              <div className="w-8 h-8 skeleton rounded-full" />
            ) : user ? (
              <>
                {/* Notifications */}
                <Link href="/notifications" className="relative p-2 text-pille-muted hover:text-white transition-colors">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rod-500 rounded-full" />
                </Link>

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-rod-900 rounded-full flex items-center justify-center">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <User size={16} className="text-rod-400" />
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium">{user.username}</div>
                      <div className="red-pill-counter text-xs py-0">
                        <Flame size={10} />
                        {user.red_pill_score}
                      </div>
                    </div>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-pille-card border border-pille-border rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link href={`/user/${user.username}`} className="flex items-center gap-2 px-4 py-2 hover:bg-pille-elevated transition-colors">
                      <User size={16} />
                      <span>Profil</span>
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2 px-4 py-2 hover:bg-pille-elevated transition-colors">
                      <span>Innstillinger</span>
                    </Link>
                    <hr className="my-2 border-pille-border" />
                    <button
                      onClick={() => signOut()}
                      className="flex items-center gap-2 px-4 py-2 w-full text-left text-rod-400 hover:bg-pille-elevated transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Logg ut</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-brutal-ghost">
                  Logg inn
                </Link>
                <Link href="/signup" className="btn-brutal text-sm py-2">
                  Våkn Opp
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-pille-muted hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="py-4 border-t border-pille-border animate-slide-up">
            <form action="/search" className="flex gap-2">
              <input
                type="search"
                name="q"
                placeholder="Søk etter sannheten..."
                className="input-brutal flex-1"
                autoFocus
              />
              <button type="submit" className="btn-brutal">
                Søk
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-pille-border animate-slide-up">
            <div className="flex flex-col gap-4">
              <Link href="/" className="flex items-center gap-2 text-pille-muted hover:text-white transition-colors">
                <Home size={18} />
                <span>Feed</span>
              </Link>
              <Link href="/trending" className="flex items-center gap-2 text-pille-muted hover:text-white transition-colors">
                <Flame size={18} />
                <span>Trending</span>
              </Link>
              {user && (
                <Link href="/create" className="flex items-center gap-2 text-rod-400 hover:text-rod-300 transition-colors">
                  <PlusCircle size={18} />
                  <span>Ny Post</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
