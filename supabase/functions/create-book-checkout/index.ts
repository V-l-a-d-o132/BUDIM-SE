import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const ALLOWED_ORIGINS = [
  'https://budimse.online',
  'https://www.budimse.online',
  'http://localhost:5173',
  'http://localhost:3000',
]

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const key = `${ip}:${Math.floor(now / windowMs)}`
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= maxRequests) return false

  entry.count++
  return true
}

function getCorsHeaders(origin: string | null) {
  const corsOrigin = ALLOWED_ORIGINS.includes(origin ?? '') ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Rate limiting: 10 req/min per IP
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(clientIp, 10, 60000)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
    )
  }

  // Origin validation
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new Response(
      JSON.stringify({ error: 'Invalid origin' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    )
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured')
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    })

    const body = await req.json()
    const { quantity = 1, format = 'physical', origin: bodyOrigin } = body

    const requestOrigin = bodyOrigin || origin || req.headers.get('referer') || 'https://localhost'

    // Strict quantity validation
    const qty = Number(quantity)
    if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
      throw new Error('Невалидно количество. Допустими стойности: 1–100.')
    }

    // Price in euro cents (EUR) — server-side only, never trust frontend price
    const prices: Record<string, number> = {
      physical: 1499, // €14.99
    }

    const priceAmount = prices[format] ?? prices.physical

    const productName = 'Петте степени — Физическа книга'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: productName,
              description: 'Авторски приложен труд на Владимир Атанасов за вниманието и дигиталните навици',
              images: ['https://static.readdy.ai/image/658b459fcf05a7723f8029c45615de2f/7fd715118976d07fe2b11b1e6367a1e7.jpeg'],
            },
            unit_amount: priceAmount,
          },
          quantity: qty,
        },
      ],
      mode: 'payment',
      success_url: `${requestOrigin}/order?success=true`,
      cancel_url: `${requestOrigin}/order?canceled=true`,
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      shipping_address_collection: {
        allowed_countries: ['BG', 'DE', 'AT', 'CH', 'GB', 'NL', 'BE', 'FR', 'IT', 'ES', 'GR'],
      },
      locale: 'bg',
      custom_text: {
        submit: {
          message: 'Ще получите потвърждение на имейл след успешно плащане.',
        },
      },
    })

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Checkout error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
