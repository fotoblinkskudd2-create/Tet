import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, queries } from '@rodpille/database'
import { FactCheckChain, ContentTagger } from '@rodpille/ai-agents'

export const runtime = 'nodejs'

// GET /api/posts - List posts
export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(request.url)

  const sort = (searchParams.get('sort') as 'trending' | 'newest' | 'redpill') || 'trending'
  const page = parseInt(searchParams.get('page') || '0')
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '10'))
  const tags = searchParams.get('tags')?.split(',').filter(Boolean)

  try {
    const posts = await queries.getFeedPosts(supabase, { sort, page, limit, tags })

    return NextResponse.json({
      posts,
      page,
      hasMore: posts.length === limit,
    })
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente poster' },
      { status: 500 }
    )
  }
}

// POST /api/posts - Create post
export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  // Get current user
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Ikke autentisert' },
      { status: 401 }
    )
  }

  // Check user role
  const { data: user } = await supabase
    .from('users')
    .select('role, is_banned')
    .eq('id', session.user.id)
    .single()

  if (!user || user.is_banned) {
    return NextResponse.json(
      { error: 'Du har ikke tilgang til å poste' },
      { status: 403 }
    )
  }

  if (!['rod_pille', 'moderator', 'admin'].includes(user.role)) {
    return NextResponse.json(
      { error: 'Du må ha "rød pille"-status for å poste. Kommenter og stem for å oppgradere!' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { title, content, source_url, tags, media_urls } = body

    // Validate required fields
    if (!title || !content || !source_url) {
      return NextResponse.json(
        { error: 'Tittel, innhold og kilde-URL er påkrevd' },
        { status: 400 }
      )
    }

    // Validate source URL
    try {
      new URL(source_url)
    } catch {
      return NextResponse.json(
        { error: 'Ugyldig kilde-URL' },
        { status: 400 }
      )
    }

    // Auto-tag content
    const tagger = new ContentTagger()
    const tagResult = await tagger.analyze(content, title, source_url)
    const aiTags = tagResult.tags
    const controversialFactor = tagResult.controversialScore / 5 // Convert to 0.2-2.0 range

    // Create the post
    const post = await queries.createPost(supabase, {
      author_id: session.user.id,
      title,
      content,
      source_url,
      tags: tags || [],
      media_urls: media_urls || [],
    })

    // Update with AI data
    await supabase
      .from('posts')
      .update({
        ai_tags: aiTags,
        controversial_factor: controversialFactor,
      })
      .eq('id', post.id)

    // Trigger async fact-check (don't wait for it)
    triggerFactCheck(post.id, source_url, content)

    return NextResponse.json({
      post: { ...post, ai_tags: aiTags },
      message: 'Post opprettet! AI-faktasjekk kjører i bakgrunnen.',
    })
  } catch (error) {
    console.error('Failed to create post:', error)
    return NextResponse.json(
      { error: 'Kunne ikke opprette post' },
      { status: 500 }
    )
  }
}

// Async fact-check function
async function triggerFactCheck(postId: string, sourceUrl: string, content: string) {
  try {
    const supabase = createServerClient()
    const factChecker = new FactCheckChain()

    const result = await factChecker.analyze(sourceUrl, content)

    // Update post with fact-check results
    await supabase
      .from('posts')
      .update({
        lie_score: result.lieScore,
        lie_analysis: result as any,
        controversial_factor: result.redPillFactor,
      })
      .eq('id', postId)

    // If lie score is very high, flag for review
    if (result.lieScore >= 80) {
      await supabase
        .from('posts')
        .update({
          is_flagged: true,
          flag_reason: 'Høy løgn-score - mulig feilinformasjon',
        })
        .eq('id', postId)
    }

    console.log(`Fact-check completed for post ${postId}: score ${result.lieScore}`)
  } catch (error) {
    console.error('Fact-check failed for post:', postId, error)
  }
}
