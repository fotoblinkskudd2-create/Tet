import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@rodpille/database'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  const supabase = createServerClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription') {
          const userId = session.metadata?.supabase_user_id

          if (userId) {
            // Get subscription details
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string
            )

            // Create subscription record
            await supabase.from('subscriptions').insert({
              user_id: userId,
              stripe_subscription_id: subscription.id,
              status: 'active',
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })

            // Update user tier
            await supabase
              .from('users')
              .update({ subscription_tier: 'elite' })
              .eq('id', userId)

            console.log(`Subscription created for user ${userId}`)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id

        if (userId) {
          const status = subscription.status === 'active' ? 'active' :
                         subscription.status === 'canceled' ? 'canceled' : 'past_due'

          await supabase
            .from('subscriptions')
            .update({
              status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id)

          // Update user tier if canceled
          if (status === 'canceled') {
            await supabase
              .from('users')
              .update({ subscription_tier: 'free' })
              .eq('id', userId)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id

        if (userId) {
          await supabase
            .from('subscriptions')
            .update({ status: 'canceled' })
            .eq('stripe_subscription_id', subscription.id)

          await supabase
            .from('users')
            .update({ subscription_tier: 'free' })
            .eq('id', userId)

          console.log(`Subscription canceled for user ${userId}`)
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Handle donations
        if (paymentIntent.metadata?.type === 'donation') {
          await supabase.from('donations').insert({
            user_id: paymentIntent.metadata.supabase_user_id === 'anonymous'
              ? null
              : paymentIntent.metadata.supabase_user_id,
            amount: paymentIntent.amount,
            stripe_payment_id: paymentIntent.id,
          })

          console.log(`Donation of ${paymentIntent.amount / 100} kr received`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId)

          // TODO: Send notification to user about failed payment
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
