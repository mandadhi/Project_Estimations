using System.Text.Json;
using Agents.Agents;
using Agents.Data;
using Agents.Data.Entities;
using Agents.Dto;
using Microsoft.Agents.AI;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;
using ProjectChat;
using SessionManager;

namespace Agents.Services
{

    public interface IRiskService
    {

        Task<AgentResult<RiskEstimationDtoResponse>> EstimateAsync(
            ProjectChatResponse chatResponse,
            CancellationToken cancellationToken = default);
        /// <summary>
        /// Runs the requirements-analysis agent for a conversation turn and returns
        /// the parsed <see cref="RiskEstimationDtoResponse"/> (or an invalid-JSON result).
        /// </summary>
        // Task<AgentResult<RiskEstimationDtoResponse>> EstimateAsync(
        //     string conversationId,
        //     string projectId,
        //     string message,
        //     CancellationToken cancellationToken = default);

        Task<AgentResult<RiskEstimationDtoResponse>> EstimateAsync(
            string conversationId,
            string projectId,
            ProjectDetails details,
            CancellationToken cancellationToken = default);
        Task SaveRisksAsync(string conversationId, string projectId, IEnumerable<RiskDto> risks, CancellationToken ct = default);
    }


    public class RiskService : IRiskService
    {

        private readonly IChatClient _chatClient;
        private readonly AgentSessionManager _sessionManager;

        private readonly AppDbContext _db;

        public RiskService(IChatClient chatClient, AgentSessionManager sessionManager, AppDbContext db)
        {
            _chatClient = chatClient;
            _sessionManager = sessionManager;
            _db = db;
        }

        public async Task<AgentResult<RiskEstimationDtoResponse>> EstimateAsync(
            ProjectChatResponse chatResponse,
            CancellationToken cancellationToken = default)
        {
            ProjectDetails? details = chatResponse.ProjectDetails;

            AIAgent agent = _chatClient.AsAIAgent(
                name: AgentDefinitions.RiskAgentName,
                instructions: AgentDefinitions.RiskInstructions);

            if (!_sessionManager.TryGetSession(chatResponse.conversation_id, out AgentSession? session))
            {
                session = await agent.CreateSessionAsync();
                _sessionManager.AddSession(chatResponse.conversation_id, session);
            }


            string input = JsonSerializer.Serialize(details);


            AgentResponse response = await agent.RunAsync(input, session: session);

            var parsed = AgentJson.TryDeserialize<RiskEstimationDtoResponse>(response.Text);

            if (parsed is null)
            {
                return AgentResult<RiskEstimationDtoResponse>.Invalid(
                    "Agent returned invalid JSON",
                    "Response could not be parsed as RiskEstimationDtoResponse",
                    response.Text);
            }

            // Ensure identifiers are always present for persistence, even if the
            // model omitted or altered them.
            parsed.ConversationId = chatResponse.conversation_id;
            parsed.ProjectId = chatResponse.project_id;

            return AgentResult<RiskEstimationDtoResponse>.Ok(parsed, response.Text);
        }



        public async Task<AgentResult<RiskEstimationDtoResponse>> EstimateAsync(
            string conversationId,
            string projectId,
            ProjectDetails details,
            CancellationToken cancellationToken = default)
        {
            var chatResponse = new ProjectChatResponse
            {
                conversation_id = conversationId,
                project_id = projectId,
                ProjectDetails = details
            };

            return await EstimateAsync(chatResponse, cancellationToken);
        }

        public async Task SaveRisksAsync(string conversationId, string projectId, IEnumerable<RiskDto> risks, CancellationToken ct = default)
        {
            // Replace the previous set so re-running estimation is idempotent.
            var old = await _db.ProjectRisks
                .Where(r => r.ConversationId == conversationId && r.ProjectId == projectId)
                .ToListAsync(ct);

            if (old.Count > 0)
            {
                _db.ProjectRisks.RemoveRange(old);
            }

            foreach (var r in risks)
            {
                _db.ProjectRisks.Add(new Risk
                {
                    ConversationId = conversationId,
                    Name = r.RiskName,
                    Description = r.RiskDescription,
                    Severity = r.Severity,
                    MitigationPlan = r.MitigationStrategy,
                    ProjectId = projectId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }

            await _db.SaveChangesAsync(ct);
        }
    }
}