import { useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { createBrowserClient, queries, PostWithAuthor } from '@rodpille/database'
import { PostCard } from '../../components/PostCard'

type SortType = 'trending' | 'newest' | 'redpill'

const POSTS_PER_PAGE = 10

export default function FeedScreen() {
  const [sort, setSort] = useState<SortType>('trending')
  const supabase = createBrowserClient()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['feed', sort],
    queryFn: async ({ pageParam = 0 }) => {
      return queries.getFeedPosts(supabase, {
        sort,
        page: pageParam,
        limit: POSTS_PER_PAGE,
      })
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length < POSTS_PER_PAGE) return undefined
      return pages.length
    },
    initialPageParam: 0,
  })

  const posts = data?.pages.flat() || []

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const renderPost = useCallback(
    ({ item }: { item: PostWithAuthor }) => <PostCard post={item} />,
    []
  )

  const renderFooter = () => {
    if (!isFetchingNextPage) return null
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator color="#ff2323" />
      </View>
    )
  }

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="flame-outline" size={64} color="#666" />
      <Text style={styles.emptyText}>Ingen poster ennå</Text>
      <Text style={styles.emptySubtext}>Vær den første til å våkne opp!</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Sort Tabs */}
      <View style={styles.sortTabs}>
        {[
          { key: 'trending', label: 'Trending', icon: 'trending-up' },
          { key: 'newest', label: 'Nyeste', icon: 'time' },
          { key: 'redpill', label: 'Rød Pille', icon: 'flame' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setSort(tab.key as SortType)}
            style={[styles.sortTab, sort === tab.key && styles.sortTabActive]}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={sort === tab.key ? '#fff' : '#666'}
            />
            <Text
              style={[
                styles.sortTabText,
                sort === tab.key && styles.sortTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Posts List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff2323" />
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ff2323" />
          <Text style={styles.errorText}>Kunne ikke laste innhold</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Prøv igjen</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#ff2323"
              colors={['#ff2323']}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  sortTabs: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  sortTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  sortTabActive: {
    backgroundColor: '#ff2323',
  },
  sortTabText: {
    color: '#666',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  sortTabTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 12,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginTop: 12,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#ff2323',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginTop: 16,
  },
  emptySubtext: {
    color: '#666',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 8,
  },
})
