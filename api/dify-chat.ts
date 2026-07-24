// Vercel Serverless Function
// Dify の API キーをブラウザに晒さないよう、フロントエンドはこのエンドポイントを叩き、
// ここからサーバー側で Dify にリクエストする。

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.DIFY_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'DIFY_API_KEY is not configured on the server' });
    return;
  }

  const baseUrl = (process.env.DIFY_API_BASE_URL || 'https://api.dify.ai/v1').replace(/\/$/, '');
  const { query, conversationId, inputs, user } = req.body ?? {};

  if (typeof query !== 'string' || !query.trim()) {
    res.status(400).json({ error: 'query is required' });
    return;
  }

  try {
    const difyRes = await fetch(`${baseUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: inputs ?? {},
        query,
        response_mode: 'blocking',
        conversation_id: conversationId || undefined,
        user: typeof user === 'string' && user ? user : 'anonymous',
      }),
    });

    const data = await difyRes.json();

    if (!difyRes.ok) {
      res.status(difyRes.status).json(data);
      return;
    }

    res.status(200).json({
      answer: data.answer,
      conversationId: data.conversation_id,
    });
  } catch {
    res.status(502).json({ error: 'Failed to reach Dify API' });
  }
}
