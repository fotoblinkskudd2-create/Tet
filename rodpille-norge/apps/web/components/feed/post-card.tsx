'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PostWithAuthor, createBrowserClient, queries } from '@rodpille/database'
import { formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Flag,
  Flame,
  ExternalLink,
  AlertTriangle,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/app/providers'
import { LieBadge } from './lie-badge'

interface PostCardProps {
  post: PostWithAuthor
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth()
  const [votes, setVotes] = useState({ up: post.upvotes, down: post.downvotes })
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const supabase = createBrowserClient()

  const handleVote = async (type: 'up' | 'down') => {
    if (!user || isVoting) return

    setIsVoting(true)
    try {
      await queries.voteOnPost(supabase, user.id, post.id, type)

      // Optimistic update
      if (userVote === type) {
        // Remove vote
        setVotes(prev => ({
          ...prev,
          [type]: prev[type] - 1,
        }))
        setUserVote(null)
      } else if (userVote) {
        // Change vote
        setVotes(prev => ({
          up: type === 'up' ? prev.up + 1 : prev.up - 1,
          down: type === 'down' ? prev.down + 1 : prev.down - 1,
        }))
        setUserVote(type)
      } else {
        // New vote
        setVotes(prev => ({
          ...prev,
          [type]: prev[type] + 1,
        }))
        setUserVote(type)
      }
    } catch (error) {
      console.error('Vote failed:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const shareToX = () => {
    const text = `${post.title} #RødPilleNorge`
    const url = `${window.location.origin}/post/${post.id}`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    )
  }

  const rageLevel = votes.down > votes.up ? Math.min(100, ((votes.down - votes.up) / Math.max(1, votes.up + votes.down)) * 100) : 0
  const isRaging = rageLevel > 50

  return (
    <article className="card-brutal overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="p-4 flex items-start gap-4">
        {/* Vote Buttons */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => handleVote('up')}
            disabled={!user || isVoting}
            className={`vote-btn ${userVote === 'up' ? 'vote-btn-up-active' : 'vote-btn-up'}`}
          >
            <ArrowBigUp size={24} />
          </button>
          <span className={`font-mono font-bold ${votes.up - votes.down >= 0 ? 'text-green-400' : 'text-rod-400'}`}>
            {votes.up - votes.down}
          </span>
          <button
            onClick={() => handleVote('down')}
            disabled={!user || isVoting}
            className={`vote-btn ${userVote === 'down' ? 'vote-btn-down-active' : 'vote-btn-down'}`}
          >
            <ArrowBigDown size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center gap-2 text-sm text-pille-muted mb-2">
            <Link href={`/user/${post.author.username}`} className="hover:text-rod-400 transition-colors">
              {post.author.username}
            </Link>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: nb })}</span>
            {post.lie_score !== null && (
              <>
                <span>•</span>
                <LieBadge score={post.lie_score} analysis={post.lie_analysis} />
              </>
            )}
            {isRaging && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-rod-500">
                  <Flame size={14} className="animate-flame" />
                  Kontroversielt
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <Link href={`/post/${post.id}`}>
            <h2 className="text-lg font-bold mb-2 hover:text-rod-400 transition-colors line-clamp-2">
              {post.title}
            </h2>
          </Link>

          {/* Content Preview */}
          <p className="text-pille-muted text-sm line-clamp-3 mb-3">
            {post.content.replace(/[#*`]/g, '').substring(0, 300)}
          </p>

          {/* Source Link */}
          <a
            href={post.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-rod-400 hover:text-rod-300 transition-colors mb-3"
          >
            <ExternalLink size={12} />
            {new URL(post.source_url).hostname}
          </a>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {[...post.tags, ...post.ai_tags].slice(0, 5).map((tag) => (
              <Link
                key={tag}
                href={`/tag/${tag}`}
                className="tag hover:tag-active transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>

          {/* Media Preview */}
          {post.media_urls && (post.media_urls as string[]).length > 0 && (
            <div className="mb-3">
              <img
                src={(post.media_urls as string[])[0]}
                alt=""
                className="w-full max-h-64 object-cover rounded border border-pille-border"
              />
            </div>
          )}

          {/* Rage Meter */}
          {isRaging && (
            <div className="mb-3">
              <div className="rage-meter">
                <div className="rage-meter-fill" style={{ width: `${rageLevel}%` }} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 text-sm text-pille-muted">
            <Link
              href={`/post/${post.id}#comments`}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <MessageSquare size={16} />
              <span>{post.comment_count || 0}</span>
            </Link>

            <button
              onClick={shareToX}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Share2 size={16} />
              <span>Del</span>
            </button>

            <Link
              href={`/post/${post.id}/wake-up`}
              className="flex items-center gap-1 hover:text-rod-400 transition-colors"
              title="Send Rist Våken-analyse"
            >
              <Zap size={16} />
              <span>Rist Våken</span>
            </Link>

            {user && (
              <button className="flex items-center gap-1 hover:text-orange-400 transition-colors ml-auto">
                <Flag size={16} />
                <span>Rapporter</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
