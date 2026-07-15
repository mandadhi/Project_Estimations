const API_BASE = "/api";

export async function sendModuleApi(conversationId, projectId, projectDetails) {
  const response = await fetch(`${API_BASE}/project/modules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      project_id: projectId,
      isMatched: true,
      response: "",
      projectDetails: projectDetails,
      missingRequirements: []
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}
