'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { createBrowserClient, queries, PostWithAuthor } from '@rodpille/database'
import { PostCard } from './post-card'
import { FeedSkeleton } from './skeleton'
import { Flame, Clock, TrendingUp } from 'lucide-react'

type SortType = 'trending' | 'newest' | 'redpill'

const POSTS_PER_PAGE = 10

export function Feed() {
  const [sort, setSort] = useState<SortType>('trending')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const supabase = createBrowserClient()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['feed', sort, selectedTags],
    queryFn: async ({ pageParam = 0 }) => {
      return queries.getFeedPosts(supabase, {
        sort,
        page: pageParam,
        limit: POSTS_PER_PAGE,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      })
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length < POSTS_PER_PAGE) return undefined
      return pages.length
    },
    initialPageParam: 0,
  })

  // Infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => observerRef.current?.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('posts-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        () => {
          // Show "new posts" banner instead of auto-refreshing
          // This is better UX than disrupting the user's scroll position
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const posts = data?.pages.flat() || []

  return (
    <div className="space-y-6">
      {/* Sort Tabs */}
      <div className="flex gap-2 border-b border-pille-border pb-4">
        <button
          onClick={() => setSort('trending')}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
            sort === 'trending'
              ? 'bg-rod-500 text-white'
              : 'text-pille-muted hover:text-white hover:bg-pille-elevated'
          }`}
        >
          <TrendingUp size={16} />
          <span>Trending</span>
        </button>
        <button
          onClick={() => setSort('newest')}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
            sort === 'newest'
              ? 'bg-rod-500 text-white'
              : 'text-pille-muted hover:text-white hover:bg-pille-elevated'
          }`}
        >
          <Clock size={16} />
          <span>Nyeste</span>
        </button>
        <button
          onClick={() => setSort('redpill')}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
            sort === 'redpill'
              ? 'bg-rod-500 text-white'
              : 'text-pille-muted hover:text-white hover:bg-pille-elevated'
          }`}
        >
          <Flame size={16} />
          <span>Rød Pille</span>
        </button>
      </div>

      {/* Posts */}
      {isLoading ? (
        <FeedSkeleton />
      ) : isError ? (
        <div className="card-brutal p-8 text-center">
          <p className="text-rod-400 mb-4">Kunne ikke laste innhold</p>
          <button onClick={() => refetch()} className="btn-brutal-outline">
            Prøv igjen
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="card-brutal p-8 text-center">
          <p className="text-pille-muted mb-4">Ingen poster ennå. Vær den første!</p>
          <a href="/create" className="btn-brutal">
            Opprett Post
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Load More */}
          <div ref={loadMoreRef} className="py-8 text-center">
            {isFetchingNextPage ? (
              <div className="flex items-center justify-center gap-2 text-pille-muted">
                <div className="w-4 h-4 border-2 border-rod-500 border-t-transparent rounded-full animate-spin" />
                <span>Laster...</span>
              </div>
            ) : hasNextPage ? (
              <button
                onClick={() => fetchNextPage()}
                className="btn-brutal-outline"
              >
                Last flere
              </button>
            ) : (
              <p className="text-pille-muted text-sm">Du har nådd bunnen. Tid for å våkne opp!</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
