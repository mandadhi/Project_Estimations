namespace Agents.Data.Entities
{
    /// <summary>
    /// The completed requirements snapshot for a conversation. One current row
    /// per conversation (upserted when the requirements agent reports isMatched).
    /// List-valued fields are persisted as JSON via value converters in AppDbContext.
    /// </summary>
    public class ProjectRequirement
    {
        public int Id { get; set; }

        public string ConversationId { get; set; } = string.Empty;

        public bool IsMatched { get; set; }

        public string ProjectObjective { get; set; } = string.Empty;

        public List<string> Scope { get; set; } = new();

        public string Platform { get; set; } = string.Empty;

        public List<string> TechnologyStack { get; set; } = new();

        public List<string> Integrations { get; set; } = new();

        public List<string> UserRoles { get; set; } = new();

        public string ExpectedUsers { get; set; } = string.Empty;

        public List<string> SecurityRequirements { get; set; } = new();

        public string PerformanceRequirements { get; set; } = string.Empty;

        public string AvailabilityRequirements { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Conversation? Conversation { get; set; }
    }
}
