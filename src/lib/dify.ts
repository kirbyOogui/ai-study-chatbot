const DIFY_USER_ID_KEY = 'dify_user_id';

function getDifyUserId(): string {
  let id = localStorage.getItem(DIFY_USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DIFY_USER_ID_KEY, id);
  }
  return id;
}

export interface DifyChatResult {
  answer: string;
  conversationId: string;
}

// Dify の API キーはサーバー側 (api/dify-chat) にのみ保持し、
// ブラウザからはこの社内エンドポイント経由でアクセスする。
export async function sendChatMessage(
  query: string,
  conversationId: string,
  inputs: Record<string, string> = {}
): Promise<DifyChatResult> {
  const res = await fetch('/api/dify-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      conversationId: conversationId || undefined,
      inputs,
      user: getDifyUserId(),
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || `サーバーエラー (${res.status})`);
  }

  return {
    answer: data.answer as string,
    conversationId: data.conversationId as string,
  };
}
