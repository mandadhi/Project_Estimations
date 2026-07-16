using Microsoft.Agents.AI;
using Microsoft.Extensions.AI;
using Agents.Agents;
using ProjectChat;
using SessionManager;
using Agents.Data;
using Agents.Data.Entities;
using Microsoft.EntityFrameworkCore;

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

        Task SaveRequirementsAsync(string conversationId, string projectId, ProjectDetails details, CancellationToken ct = default);
        Task<ProjectDetails?> GetRequirementsAsync(string conversationId, string projectId, CancellationToken ct = default);
    }

    public class RequirementsService : IRequirementsService
    {
        private readonly IChatClient _chatClient;
        private readonly AgentSessionManager _sessionManager;

        private readonly AppDbContext _db;

        public RequirementsService(IChatClient chatClient, AgentSessionManager sessionManager, AppDbContext db)
        {
            _chatClient = chatClient;
            _sessionManager = sessionManager;
            _db = db;
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

        public async Task SaveRequirementsAsync(string conversationId, string projectId, ProjectDetails details, CancellationToken ct = default)
        {
            var existing = await _db.ProjectRequirements
                .FirstOrDefaultAsync(r => r.ConversationId == conversationId && r.ProjectId == projectId, ct);

            if (existing is null)
            {
                existing = new ProjectRequirement { ConversationId = conversationId, ProjectId = projectId };
                _db.ProjectRequirements.Add(existing);
            }

            existing.IsMatched = true;
            existing.ProjectObjective = details.ProjectObjective;
            existing.Scope = details.Scope;
            existing.Platform = details.Platform;
            existing.TechnologyStack = details.TechnologyStack;
            existing.Integrations = details.Integrations;
            existing.UserRoles = details.UserRoles;
            existing.ExpectedUsers = details.ExpectedUsers;
            existing.SecurityRequirements = details.SecurityRequirements;
            existing.PerformanceRequirements = details.PerformanceRequirements;
            existing.AvailabilityRequirements = details.AvailabilityRequirements;
            existing.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);
        }

        public async Task<ProjectDetails?> GetRequirementsAsync(string conversationId, string projectId, CancellationToken ct = default)
        {
            var r = await _db.ProjectRequirements
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.ConversationId == conversationId && x.ProjectId == projectId && x.IsMatched, ct);

            if (r is null)
            {
                return null;
            }

            return new ProjectDetails
            {
                ProjectObjective = r.ProjectObjective,
                Scope = r.Scope,
                Platform = r.Platform,
                TechnologyStack = r.TechnologyStack,
                Integrations = r.Integrations,
                UserRoles = r.UserRoles,
                ExpectedUsers = r.ExpectedUsers,
                SecurityRequirements = r.SecurityRequirements,
                PerformanceRequirements = r.PerformanceRequirements,
                AvailabilityRequirements = r.AvailabilityRequirements
            };
        }

    }
}
