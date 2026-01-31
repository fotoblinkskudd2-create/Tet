import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@rodpille/database'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const { amount } = await request.json()

    // Validate amount (minimum 10 kr = 1000 øre)
    if (!amount || amount < 1000) {
      return NextResponse.json(
        { error: 'Minimum donasjon er 10 kr' },
        { status: 400 }
      )
    }

    // Get user if authenticated (donations can be anonymous)
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'nok',
      metadata: {
        type: 'donation',
        supabase_user_id: userId || 'anonymous',
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Failed to create donation:', error)
    return NextResponse.json(
      { error: 'Kunne ikke opprette donasjon' },
      { status: 500 }
    )
  }
}

// GET endpoint to get total donations
export async function GET() {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase
      .from('donations')
      .select('amount')

    if (error) throw error

    const total = (data || []).reduce((sum, d) => sum + d.amount, 0)

    return NextResponse.json({
      total,
      totalKr: total / 100,
      count: data?.length || 0,
    })
  } catch (error) {
    console.error('Failed to get donations:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente donasjoner' },
      { status: 500 }
    )
  }
}
