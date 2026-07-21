import { supabase } from '../../lib/supabase';

export async function POST(request: Request) {
  try {
    const { candidateId } = await request.json();
    
    // Get candidate details
    const { data: candidate, error } = await supabase
      .from('talents')
      .select('name, job')
      .eq('id', candidateId)
      .single();
    
    if (error) throw error;
    
    // Send notification via Expo API
    const { data: tokens, error: tokensError } = await supabase
      .from('device_tokens')
      .select('token');
    
    if (tokensError) throw tokensError;
    
    // Send to all tokens
    const messages = tokens.map(({ token }) => ({
      to: token,
      sound: 'default',
      title: `🆕 New Candidate Available!`,
      body: `${candidate.name} - ${candidate.job}`,
      data: {
        type: 'new_candidate',
        candidateId: candidateId,
      },
    }));
    
    // Send notifications
    const responses = await Promise.all(
      messages.map(async (message) => {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
        return response.json();
      })
    );
    
    return new Response(JSON.stringify({ success: true, responses }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}