const API_BASE = "/api";

export async function sendChatMessage(conversationId, message, project_id) {
  const response = await fetch(`${API_BASE}/project/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      project_id: project_id,
      message: message
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}
