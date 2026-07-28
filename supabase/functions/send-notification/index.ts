import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================
// 📝 EDIT NOTIFICATION CONTENT HERE
// ============================================

const WELCOME_CONFIG = {
  title: '🎉 Welcome to ZOD Manpower!',
  body: 'New Offers are coming soon! Take Your Housemaid & Driver With 25% Discount. Visit our office and order your new application. Terms and conditions applied.',
  type: 'welcome',
  url: 'https://zodmanpower.info'
}

const CANDIDATE_CONFIG = {
  title: '🆕 New Candidate Available!',
  type: 'new_candidate'
}

// ============================================
// 📝 EDIT NOTIFICATION SOUND
// ============================================

const SOUND = 'default'  // Options: 'default', 'custom.wav'

// ============================================
// MAIN FUNCTION
// ============================================

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    console.log('📩 Request body:', body)

    const { candidateId, isWelcome, isCustom, title, body: customBody, type } = body

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Get all device tokens
    const tokensResponse = await fetch(
      `${supabaseUrl}/rest/v1/device_tokens?select=token`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
      }
    )

    const tokensData = await tokensResponse.json()
    const tokens = tokensData.map((t: any) => t.token)

    if (tokens.length === 0) {
      console.log('⚠️ No device tokens found')
      return new Response(
        JSON.stringify({ success: true, message: 'No tokens found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    console.log(`📱 Sending to ${tokens.length} devices`)

    // ============================================
    // ✅ 1. WELCOME NOTIFICATION
    // ============================================
    if (isWelcome === true) {
      console.log('📢 Sending welcome notification...')

      const messages = tokens.map((token: string) => ({
        to: token,
        sound: SOUND,
        title: WELCOME_CONFIG.title,
        body: WELCOME_CONFIG.body,
        data: {
          type: WELCOME_CONFIG.type,
          url: WELCOME_CONFIG.url
        },
        badge: 1,
      }))

      const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      })

      const expoResult = await expoResponse.json()

      return new Response(
        JSON.stringify({
          success: true,
          tokens: tokens.length,
          message: 'Welcome notification sent',
          expoResult
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // ============================================
    // ✅ 2. CUSTOM NOTIFICATION (Dynamic)
    // ============================================
    if (isCustom === true || title || customBody) {
      console.log('📢 Sending custom notification...')

      const customTitle = title || '📢 New Update!'
      const customBodyText = customBody || 'Check out the latest updates from ZOD Manpower.'
      const customType = type || 'custom'

      const messages = tokens.map((token: string) => ({
        to: token,
        sound: SOUND,
        title: customTitle,
        body: customBodyText,
        data: {
          type: customType,
        },
        badge: 1,
      }))

      const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      })

      const expoResult = await expoResponse.json()

      return new Response(
        JSON.stringify({
          success: true,
          tokens: tokens.length,
          message: 'Custom notification sent',
          expoResult
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // ============================================
    // ✅ 3. CANDIDATE NOTIFICATION
    // ============================================
    if (!candidateId) {
      return new Response(
        JSON.stringify({ error: 'candidateId is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log('🔔 New candidate added:', candidateId)

    // Fetch candidate details
    const candidateResponse = await fetch(
      `${supabaseUrl}/rest/v1/talents?id=eq.${candidateId}&select=name,job`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
      }
    )

    const candidateData = await candidateResponse.json()
    const candidate = candidateData[0]

    if (!candidate) {
      throw new Error('Candidate not found')
    }

    console.log('📋 Candidate:', candidate.name, '-', candidate.job)

    const messages = tokens.map((token: string) => ({
      to: token,
      sound: SOUND,
      title: CANDIDATE_CONFIG.title,
      body: `${candidate.name} - ${candidate.job}`,
      data: {
        type: CANDIDATE_CONFIG.type,
        candidateId: candidateId,
      },
      badge: 1,
    }))

    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    const expoResult = await expoResponse.json()

    return new Response(
      JSON.stringify({
        success: true,
        tokens: tokens.length,
        expoResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})