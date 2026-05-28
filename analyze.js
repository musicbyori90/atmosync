export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { trackName } = await req.json();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Analyze this music track name and return ONLY valid JSON, no markdown.\nTrack: "${trackName}"\n{"genre":"Ambient/Acoustic/Jazz/Electronic/Chill/Lounge/World/Classical/Pop/Asian Fusion/Mediterranean","energy":70,"mood_tags":"2 Hebrew mood words","name":"clean name"}`
      }],
    }),
  });

  const data = await response.json();
  const text = data.content?.map(i => i.text || '').join('') || '';
  
  try {
    const result = JSON.parse(text.replace(/```json|```/g, '').trim());
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ genre: 'Ambient', energy: 60, mood_tags: 'נעים,רגוע', name: trackName }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
