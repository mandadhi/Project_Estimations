using Microsoft.Agents.AI;
using Microsoft.Extensions.AI;
using Agents.Agents;
using ProjectChat;
using SessionManager;

namespace Agents.Services
{
    public interface IRequirementsService
    {
        /// <summary>
        /// Runs the requirements-analysis agent for a conversation turn and returns
        /// the parsed <see cref="ProjectChatResponse"/> (or an invalid-JSON result).
        /// </summary>
        Task<AgentResult<ProjectChatResponse>> AnalyzeAsync(
            string conversationId,
            string projectId,
            string message,
            CancellationToken cancellationToken = default);
    }

    public class RequirementsService : IRequirementsService
    {
        private readonly IChatClient _chatClient;
        private readonly AgentSessionManager _sessionManager;

        public RequirementsService(IChatClient chatClient, AgentSessionManager sessionManager)
        {
            _chatClient = chatClient;
            _sessionManager = sessionManager;
        }

        public async Task<AgentResult<ProjectChatResponse>> AnalyzeAsync(
            string conversationId,
            string projectId,
            string message,
            CancellationToken cancellationToken = default)
        {
            AIAgent agent = _chatClient.AsAIAgent(
                name: AgentDefinitions.RequirementsAgentName,
                instructions: AgentDefinitions.RequirementsInstructions);

            if (!_sessionManager.TryGetSession(conversationId, out AgentSession? session))
            {
                session = await agent.CreateSessionAsync();
                _sessionManager.AddSession(conversationId, session);
            }

            AgentResponse response = await agent.RunAsync(message, session: session);

            var parsed = AgentJson.TryDeserialize<ProjectChatResponse>(response.Text);
            if (parsed is null)
            {
                return AgentResult<ProjectChatResponse>.Invalid(
                    "Agent returned invalid JSON",
                    "Response could not be parsed as ProjectChatResponse",
                    response.Text);
            }

            // Ensure identifiers round-trip regardless of what the model echoed.
            parsed.conversation_id = conversationId;
            parsed.project_id = projectId;

            return AgentResult<ProjectChatResponse>.Ok(parsed, response.Text);
        }
    }
}
