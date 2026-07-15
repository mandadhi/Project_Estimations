namespace Agents.Data.Entities
{
    /// <summary>
    /// Top-level grouping for a single estimation conversation. Keyed by the
    /// client-supplied conversation_id so the frontend can reload prior state.
    /// </summary>
    public class Conversation
    {
        public string Id { get; set; } = string.Empty;

        public string ProjectId { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        // Navigation
        public List<ChatMessage> Messages { get; set; } = new();

        public ProjectRequirement? Requirement { get; set; }

        public List<ProjectModule> Modules { get; set; } = new();
    }
}
