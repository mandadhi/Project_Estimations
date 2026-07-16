using Agents.Data;
using Agents.Data.Entities;
using Agents.Dto;
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


        /// <summary>Ordered chat history for the frontend.</summary>
        Task<List<ChatMessage>> GetHistoryAsync(string conversationId, CancellationToken ct = default);

        /// <summary>Full persisted snapshot (requirements + modules) for a conversation.</summary>
        Task<Conversation?> GetConversationAsync(string conversationId, CancellationToken ct = default);

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

    }
}
