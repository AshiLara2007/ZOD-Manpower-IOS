import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { candidateId } = await req.json()
    
    if (!candidateId) {
      throw new Error('candidateId is required')
    }

    console.log('🔔 New candidate added:', candidateId)

    // Get candidate details from Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

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

    console.log('📱 Sending to', tokens.length, 'devices')

    // Prepare push notifications
    const messages = tokens.map((token: string) => ({
      to: token,
      sound: 'default',
      title: '🆕 New Candidate Available!',
      body: `${candidate.name} - ${candidate.job}`,
      data: {
        type: 'new_candidate',
        candidateId: candidateId,
      },
      badge: 1,
    }))

    // Send to Expo Push Notification API
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

    console.log('✅ Notifications sent:', expoResult)

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