using Agents.Data;
using Agents.Data.Entities;
using Microsoft.EntityFrameworkCore;
using ModuleEstimation;
using ProjectChat;

namespace Agents.Services
{
    public interface IChatHistoryService
    {
        /// <summary>Ensures a Conversation row exists (creates it on first turn).</summary>
        Task EnsureConversationAsync(string conversationId, string projectId, CancellationToken ct = default);

        /// <summary>Appends a chat message and bumps the conversation's UpdatedAt.</summary>
        Task<ChatMessage> AddMessageAsync(
            string conversationId, string role, string content, string kind = "text", CancellationToken ct = default);

        /// <summary>Upserts the completed requirements snapshot for a conversation.</summary>
        Task SaveRequirementsAsync(string conversationId, ProjectDetails details, CancellationToken ct = default);

        /// <summary>Replaces the persisted module set for a conversation.</summary>
        Task SaveModulesAsync(string conversationId, IEnumerable<ModuleDto> modules, CancellationToken ct = default);

        /// <summary>Ordered chat history for the frontend.</summary>
        Task<List<ChatMessage>> GetHistoryAsync(string conversationId, CancellationToken ct = default);

        /// <summary>Full persisted snapshot (requirements + modules) for a conversation.</summary>
        Task<Conversation?> GetConversationAsync(string conversationId, CancellationToken ct = default);

        /// <summary>
        /// Reconstructs the completed <see cref="ProjectDetails"/> for a conversation
        /// from the persisted requirements snapshot, or null if none is stored.
        /// </summary>
        Task<ProjectDetails?> GetRequirementsAsync(string conversationId, CancellationToken ct = default);
    }

    public class ChatHistoryService : IChatHistoryService
    {
        private readonly AppDbContext _db;

        public ChatHistoryService(AppDbContext db)
        {
            _db = db;
        }

        public async Task EnsureConversationAsync(string conversationId, string projectId, CancellationToken ct = default)
        {
            var conversation = await _db.Conversations.FindAsync(new object[] { conversationId }, ct);
            if (conversation is null)
            {
                _db.Conversations.Add(new Conversation
                {
                    Id = conversationId,
                    ProjectId = projectId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
                await _db.SaveChangesAsync(ct);
            }
            else if (!string.IsNullOrWhiteSpace(projectId) && conversation.ProjectId != projectId)
            {
                conversation.ProjectId = projectId;
                conversation.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync(ct);
            }
        }

        public async Task<ChatMessage> AddMessageAsync(
            string conversationId, string role, string content, string kind = "text", CancellationToken ct = default)
        {
            var message = new ChatMessage
            {
                ConversationId = conversationId,
                Role = role,
                Content = content,
                Kind = kind,
                CreatedAt = DateTime.UtcNow
            };

            _db.ChatMessages.Add(message);

            var conversation = await _db.Conversations.FindAsync(new object[] { conversationId }, ct);
            if (conversation is not null)
            {
                conversation.UpdatedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync(ct);
            return message;
        }

        public async Task SaveRequirementsAsync(string conversationId, ProjectDetails details, CancellationToken ct = default)
        {
            var existing = await _db.ProjectRequirements
                .FirstOrDefaultAsync(r => r.ConversationId == conversationId, ct);

            if (existing is null)
            {
                existing = new ProjectRequirement { ConversationId = conversationId };
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

        public async Task SaveModulesAsync(string conversationId, IEnumerable<ModuleDto> modules, CancellationToken ct = default)
        {
            // Replace the previous set so re-running estimation is idempotent.
            var old = await _db.ProjectModules
                .Where(m => m.ConversationId == conversationId)
                .ToListAsync(ct);

            if (old.Count > 0)
            {
                _db.ProjectModules.RemoveRange(old);
            }

            foreach (var m in modules)
            {
                _db.ProjectModules.Add(new ProjectModule
                {
                    ConversationId = conversationId,
                    ModuleName = m.module_name,
                    Description = m.description,
                    IsRequired = m.is_required,
                    Dependencies = m.dependencies ?? new List<string>(),
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _db.SaveChangesAsync(ct);
        }

        public async Task<List<ChatMessage>> GetHistoryAsync(string conversationId, CancellationToken ct = default)
        {
            return await _db.ChatMessages
                .Where(m => m.ConversationId == conversationId)
                .OrderBy(m => m.Id)
                .AsNoTracking()
                .ToListAsync(ct);
        }

        public async Task<Conversation?> GetConversationAsync(string conversationId, CancellationToken ct = default)
        {
            return await _db.Conversations
                .Include(c => c.Requirement)
                .Include(c => c.Modules)
                .Include(c => c.Messages.OrderBy(m => m.Id))
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == conversationId, ct);
        }

        public async Task<ProjectDetails?> GetRequirementsAsync(string conversationId, CancellationToken ct = default)
        {
            var r = await _db.ProjectRequirements
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.ConversationId == conversationId && x.IsMatched, ct);

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
