import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@rodpille/database'
import { FactCheckChain } from '@rodpille/ai-agents'

export const runtime = 'nodejs'
export const maxDuration = 60 // Allow 60 seconds for AI processing

// POST /api/ai/fact-check - Run fact-check on content
export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Ikke autentisert' },
      { status: 401 }
    )
  }

  try {
    const { source_url, content, post_id } = await request.json()

    if (!source_url || !content) {
      return NextResponse.json(
        { error: 'source_url og content er påkrevd' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(source_url)
    } catch {
      return NextResponse.json(
        { error: 'Ugyldig URL' },
        { status: 400 }
      )
    }

    const factChecker = new FactCheckChain()
    const result = await factChecker.analyze(source_url, content)

    // If post_id provided, update the post
    if (post_id) {
      await supabase
        .from('posts')
        .update({
          lie_score: result.lieScore,
          lie_analysis: result as any,
          controversial_factor: result.redPillFactor,
        })
        .eq('id', post_id)
    }

    return NextResponse.json({
      result,
      message: `Faktasjekk fullført. Løgn-score: ${result.lieScore}/100`,
    })
  } catch (error) {
    console.error('Fact-check failed:', error)
    return NextResponse.json(
      { error: 'Faktasjekk feilet. Prøv igjen senere.' },
      { status: 500 }
    )
  }
}

// GET /api/ai/fact-check/quick - Quick check without full analysis
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get('text')

  if (!text) {
    return NextResponse.json(
      { error: 'text parameter er påkrevd' },
      { status: 400 }
    )
  }

  try {
    const factChecker = new FactCheckChain()
    const result = await factChecker.quickCheck(text)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Quick check failed:', error)
    return NextResponse.json(
      { error: 'Hurtigsjekk feilet' },
      { status: 500 }
    )
  }
}
