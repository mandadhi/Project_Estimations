using Microsoft.AspNetCore.Mvc;
using Agents.Services;

namespace History
{
    /// <summary>
    /// Read endpoints the frontend uses to reload prior chat history and the
    /// persisted requirements + modules snapshot for a conversation.
    /// </summary>
    [ApiController]
    [Route("project")]
    public class HistoryController : ControllerBase
    {
        private readonly IChatHistoryService _history;

        public HistoryController(IChatHistoryService history)
        {
            _history = history;
        }

        /// <summary>Ordered chat messages for a conversation.</summary>
        [HttpGet("{conversationId}/history")]
        public async Task<IActionResult> GetHistory(string conversationId)
        {
            var messages = await _history.GetHistoryAsync(conversationId);

            var payload = messages.Select(m => new
            {
                id = m.Id,
                conversation_id = m.ConversationId,
                role = m.Role,
                content = m.Content,
                kind = m.Kind,
                created_at = m.CreatedAt
            });

            return Ok(new { conversation_id = conversationId, messages = payload });
        }

        /// <summary>Persisted requirements + module snapshot for a conversation.</summary>
        [HttpGet("{conversationId}")]
        public async Task<IActionResult> GetConversation(string conversationId)
        {
            var conversation = await _history.GetConversationAsync(conversationId);
            if (conversation is null)
            {
                return NotFound(new { error = "Conversation not found", conversation_id = conversationId });
            }

            return Ok(new
            {
                conversation_id = conversation.Id,
                project_id = conversation.ProjectId,
                created_at = conversation.CreatedAt,
                updated_at = conversation.UpdatedAt,
                requirements = conversation.Requirement is null ? null : new
                {
                    is_matched = conversation.Requirement.IsMatched,
                    projectObjective = conversation.Requirement.ProjectObjective,
                    scope = conversation.Requirement.Scope,
                    platform = conversation.Requirement.Platform,
                    technologyStack = conversation.Requirement.TechnologyStack,
                    integrations = conversation.Requirement.Integrations,
                    userRoles = conversation.Requirement.UserRoles,
                    expectedUsers = conversation.Requirement.ExpectedUsers,
                    securityRequirements = conversation.Requirement.SecurityRequirements,
                    performanceRequirements = conversation.Requirement.PerformanceRequirements,
                    availabilityRequirements = conversation.Requirement.AvailabilityRequirements,
                    updated_at = conversation.Requirement.UpdatedAt
                },
                modules = conversation.Modules
                    .OrderBy(m => m.Id)
                    .Select(m => new
                    {
                        module_name = m.ModuleName,
                        description = m.Description,
                        is_required = m.IsRequired,
                        dependencies = m.Dependencies
                    })
            });
        }
    }
}
