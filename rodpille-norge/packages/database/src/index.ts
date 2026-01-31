// Re-export all types
export * from './types'

// Re-export client utilities
export {
  createBrowserClient,
  createServerClient,
  createServerComponentClient,
  supabase,
  type TypedSupabaseClient
} from './client'

// Query helpers
import { TypedSupabaseClient } from './client'
import { Post, PostWithAuthor, User, Comment, CommentWithAuthor, LieAnalysis } from './types'

export const queries = {
  // Feed queries
  async getFeedPosts(
    client: TypedSupabaseClient,
    options: {
      sort: 'trending' | 'newest' | 'redpill'
      page: number
      limit: number
      tags?: string[]
    }
  ): Promise<PostWithAuthor[]> {
    let query = client
      .from('posts')
      .select(`
        *,
        author:users!author_id(*)
      `)
      .eq('is_flagged', false)

    // Filter by tags if provided
    if (options.tags && options.tags.length > 0) {
      query = query.overlaps('tags', options.tags)
    }

    // Sort based on option
    switch (options.sort) {
      case 'trending':
        // Hot algorithm: score / (age in hours + 2)^1.5
        query = query.order('red_pill_score', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'redpill':
        query = query.order('red_pill_score', { ascending: false })
        break
    }

    // Pagination
    const from = options.page * options.limit
    const to = from + options.limit - 1
    query = query.range(from, to)

    const { data, error } = await query

    if (error) throw error
    return (data as unknown as PostWithAuthor[]) || []
  },

  // Single post
  async getPost(client: TypedSupabaseClient, postId: string): Promise<PostWithAuthor | null> {
    const { data, error } = await client
      .from('posts')
      .select(`
        *,
        author:users!author_id(*)
      `)
      .eq('id', postId)
      .single()

    if (error) throw error
    return data as unknown as PostWithAuthor
  },

  // Comments for a post
  async getComments(client: TypedSupabaseClient, postId: string): Promise<CommentWithAuthor[]> {
    const { data, error } = await client
      .from('comments')
      .select(`
        *,
        author:users!author_id(*)
      `)
      .eq('post_id', postId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Build tree structure
    const comments = data as unknown as CommentWithAuthor[]
    const commentMap = new Map<string, CommentWithAuthor>()
    const rootComments: CommentWithAuthor[] = []

    comments.forEach(comment => {
      comment.replies = []
      commentMap.set(comment.id, comment)
    })

    comments.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id)
        if (parent) {
          parent.replies!.push(comment)
        }
      } else {
        rootComments.push(comment)
      }
    })

    return rootComments
  },

  // User profile
  async getUser(client: TypedSupabaseClient, userId: string): Promise<User | null> {
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  // User's posts
  async getUserPosts(client: TypedSupabaseClient, userId: string, page = 0, limit = 20): Promise<Post[]> {
    const from = page * limit
    const to = from + limit - 1

    const { data, error } = await client
      .from('posts')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error
    return data || []
  },

  // Vote on post
  async voteOnPost(
    client: TypedSupabaseClient,
    userId: string,
    postId: string,
    voteType: 'up' | 'down'
  ): Promise<void> {
    // Check existing vote
    const { data: existing } = await client
      .from('votes')
      .select('*')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single()

    if (existing) {
      if (existing.vote_type === voteType) {
        // Remove vote
        await client.from('votes').delete().eq('id', existing.id)
        // Update post counts
        const field = voteType === 'up' ? 'upvotes' : 'downvotes'
        await client.rpc('decrement_vote', { post_id: postId, vote_field: field })
      } else {
        // Change vote
        await client.from('votes').update({ vote_type: voteType }).eq('id', existing.id)
        // Update both counts
        const incField = voteType === 'up' ? 'upvotes' : 'downvotes'
        const decField = voteType === 'up' ? 'downvotes' : 'upvotes'
        await client.rpc('swap_vote', { post_id: postId, inc_field: incField, dec_field: decField })
      }
    } else {
      // New vote
      await client.from('votes').insert({ user_id: userId, post_id: postId, vote_type: voteType })
      const field = voteType === 'up' ? 'upvotes' : 'downvotes'
      await client.rpc('increment_vote', { post_id: postId, vote_field: field })
    }

    // Recalculate red pill score
    await client.rpc('calculate_red_pill_score', { post_id: postId })
  },

  // Create post
  async createPost(
    client: TypedSupabaseClient,
    post: {
      author_id: string
      title: string
      content: string
      source_url: string
      tags: string[]
      media_urls?: string[]
    }
  ): Promise<Post> {
    const { data, error } = await client
      .from('posts')
      .insert({
        author_id: post.author_id,
        title: post.title,
        content: post.content,
        source_url: post.source_url,
        tags: post.tags,
        media_urls: post.media_urls || [],
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get total donations
  async getTotalDonations(client: TypedSupabaseClient): Promise<number> {
    const { data, error } = await client
      .from('donations')
      .select('amount')

    if (error) throw error
    return (data || []).reduce((sum, d) => sum + d.amount, 0)
  },

  // Get known lies for fact-checking
  async getKnownLies(client: TypedSupabaseClient, party?: string): Promise<any[]> {
    let query = client.from('known_lies').select('*')
    if (party) {
      query = query.eq('party', party)
    }
    const { data, error } = await query
    if (error) throw error
    return data || []
  }
}
