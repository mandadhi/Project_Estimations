using System.Text.Json;
using Microsoft.Agents.AI;
using Microsoft.Extensions.AI;
using Agents.Agents;
using ModuleEstimation;
using ProjectChat;
using SessionManager;

namespace Agents.Services
{
    public interface IModulesService
    {
        /// <summary>
        /// Runs the modules-estimation agent over a completed requirements payload
        /// and returns the parsed <see cref="ModuleEstimationDto"/> (or invalid-JSON).
        /// </summary>
        Task<AgentResult<ModuleEstimationDto>> EstimateAsync(
            ProjectChatResponse chatResponse,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Convenience overload for the orchestrator: estimate modules directly from a
        /// <see cref="ProjectDetails"/> plus the conversation/project identifiers.
        /// </summary>
        Task<AgentResult<ModuleEstimationDto>> EstimateAsync(
            string conversationId,
            string projectId,
            ProjectDetails details,
            CancellationToken cancellationToken = default);
    }

    public class ModulesService : IModulesService
    {
        private readonly IChatClient _chatClient;
        private readonly AgentSessionManager _sessionManager;

        public ModulesService(IChatClient chatClient, AgentSessionManager sessionManager)
        {
            _chatClient = chatClient;
            _sessionManager = sessionManager;
        }

        public async Task<AgentResult<ModuleEstimationDto>> EstimateAsync(
            ProjectChatResponse chatResponse,
            CancellationToken cancellationToken = default)
        {
            ProjectDetails? details = chatResponse.ProjectDetails;

            AIAgent agent = _chatClient.AsAIAgent(
                name: AgentDefinitions.ModulesAgentName,
                instructions: AgentDefinitions.ModulesInstructions);

            if (!_sessionManager.TryGetSession(chatResponse.conversation_id, out AgentSession? session))
            {
                session = await agent.CreateSessionAsync();
                _sessionManager.AddSession(chatResponse.conversation_id, session);
            }

            string input = JsonSerializer.Serialize(details);

            AgentResponse response = await agent.RunAsync(input, session: session);

            var parsed = AgentJson.TryDeserialize<ModuleEstimationDto>(response.Text);
            if (parsed is null)
            {
                return AgentResult<ModuleEstimationDto>.Invalid(
                    "Agent returned invalid JSON",
                    "Response could not be parsed as ModuleEstimationDto",
                    response.Text);
            }

            // Ensure identifiers are always present for persistence, even if the
            // model omitted or altered them.
            parsed.conversation_id = chatResponse.conversation_id;
            parsed.project_id = chatResponse.project_id;

            return AgentResult<ModuleEstimationDto>.Ok(parsed, response.Text);
        }

        public Task<AgentResult<ModuleEstimationDto>> EstimateAsync(
            string conversationId,
            string projectId,
            ProjectDetails details,
            CancellationToken cancellationToken = default)
        {
            var chatResponse = new ProjectChatResponse
            {
                conversation_id = conversationId,
                project_id = projectId,
                IsMatched = true,
                ProjectDetails = details
            };

            return EstimateAsync(chatResponse, cancellationToken);
        }
    }
}
