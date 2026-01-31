import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Share,
} from 'react-native'
import { Link, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { PostWithAuthor, createBrowserClient, queries } from '@rodpille/database'
import { formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'
import { useAuth } from '../lib/auth'

interface PostCardProps {
  post: PostWithAuthor
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth()
  const [votes, setVotes] = useState({ up: post.upvotes, down: post.downvotes })
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const supabase = createBrowserClient()

  const handleVote = async (type: 'up' | 'down') => {
    if (!user) {
      router.push('/(auth)/login')
      return
    }

    try {
      await queries.voteOnPost(supabase, user.id, post.id, type)

      if (userVote === type) {
        setVotes((prev) => ({ ...prev, [type]: prev[type] - 1 }))
        setUserVote(null)
      } else if (userVote) {
        setVotes((prev) => ({
          up: type === 'up' ? prev.up + 1 : prev.up - 1,
          down: type === 'down' ? prev.down + 1 : prev.down - 1,
        }))
        setUserVote(type)
      } else {
        setVotes((prev) => ({ ...prev, [type]: prev[type] + 1 }))
        setUserVote(type)
      }
    } catch (error) {
      console.error('Vote failed:', error)
    }
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${post.title} #RødPilleNorge\n\nhttps://rodpillenorge.no/post/${post.id}`,
      })
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  const rageLevel = votes.down > votes.up
    ? Math.min(100, ((votes.down - votes.up) / Math.max(1, votes.up + votes.down)) * 100)
    : 0
  const isRaging = rageLevel > 50

  const getLieScoreColor = (score: number) => {
    if (score >= 70) return '#ff2323'
    if (score >= 40) return '#f59e0b'
    return '#22c55e'
  }

  return (
    <Pressable
      onPress={() => router.push(`/post/${post.id}`)}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        {/* Vote Buttons */}
        <View style={styles.voteContainer}>
          <TouchableOpacity
            onPress={() => handleVote('up')}
            style={styles.voteButton}
          >
            <Ionicons
              name={userVote === 'up' ? 'arrow-up' : 'arrow-up-outline'}
              size={24}
              color={userVote === 'up' ? '#22c55e' : '#666'}
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.voteCount,
              { color: votes.up - votes.down >= 0 ? '#22c55e' : '#ff2323' },
            ]}
          >
            {votes.up - votes.down}
          </Text>
          <TouchableOpacity
            onPress={() => handleVote('down')}
            style={styles.voteButton}
          >
            <Ionicons
              name={userVote === 'down' ? 'arrow-down' : 'arrow-down-outline'}
              size={24}
              color={userVote === 'down' ? '#ff2323' : '#666'}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Meta */}
          <View style={styles.meta}>
            <TouchableOpacity
              onPress={() => router.push(`/user/${post.author.username}`)}
            >
              <Text style={styles.username}>{post.author.username}</Text>
            </TouchableOpacity>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.timestamp}>
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
                locale: nb,
              })}
            </Text>
            {post.lie_score !== null && (
              <>
                <Text style={styles.metaDot}>•</Text>
                <View
                  style={[
                    styles.lieBadge,
                    { backgroundColor: getLieScoreColor(post.lie_score) + '20' },
                  ]}
                >
                  <Ionicons
                    name="alert-circle"
                    size={10}
                    color={getLieScoreColor(post.lie_score)}
                  />
                  <Text
                    style={[
                      styles.lieBadgeText,
                      { color: getLieScoreColor(post.lie_score) },
                    ]}
                  >
                    {post.lie_score}%
                  </Text>
                </View>
              </>
            )}
            {isRaging && (
              <>
                <Text style={styles.metaDot}>•</Text>
                <Ionicons name="flame" size={14} color="#ff2323" />
              </>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {post.title}
          </Text>

          {/* Content Preview */}
          <Text style={styles.preview} numberOfLines={3}>
            {post.content.replace(/[#*`]/g, '').substring(0, 200)}
          </Text>

          {/* Source */}
          <TouchableOpacity style={styles.sourceLink}>
            <Ionicons name="link-outline" size={12} color="#ff2323" />
            <Text style={styles.sourceText}>
              {new URL(post.source_url).hostname}
            </Text>
          </TouchableOpacity>

          {/* Tags */}
          <View style={styles.tags}>
            {[...post.tags, ...post.ai_tags].slice(0, 4).map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.tag}
                onPress={() => router.push(`/tag/${tag}`)}
              >
                <Text style={styles.tagText}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Media */}
          {post.media_urls && (post.media_urls as string[]).length > 0 && (
            <Image
              source={{ uri: (post.media_urls as string[])[0] }}
              style={styles.media}
              contentFit="cover"
            />
          )}

          {/* Rage Meter */}
          {isRaging && (
            <View style={styles.rageMeter}>
              <View
                style={[styles.rageMeterFill, { width: `${rageLevel}%` }]}
              />
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={16} color="#666" />
              <Text style={styles.actionText}>{post.comment_count || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              style={styles.actionButton}
            >
              <Ionicons name="share-outline" size={16} color="#666" />
              <Text style={styles.actionText}>Del</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="flash-outline" size={16} color="#666" />
              <Text style={styles.actionText}>Rist</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  header: {
    flexDirection: 'row',
    padding: 12,
  },
  voteContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  voteButton: {
    padding: 4,
  },
  voteCount: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    marginVertical: 4,
  },
  content: {
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  username: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 13,
  },
  metaDot: {
    color: '#666',
    marginHorizontal: 6,
  },
  timestamp: {
    color: '#666',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  lieBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  lieBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
  },
  title: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
  preview: {
    color: '#888',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  sourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  sourceText: {
    color: '#ff2323',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#4b0000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#880c0c',
  },
  tagText: {
    color: '#ff5757',
    fontFamily: 'Inter-Medium',
    fontSize: 11,
  },
  media: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  rageMeter: {
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  rageMeterFill: {
    height: '100%',
    backgroundColor: '#ff2323',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#666',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
})
