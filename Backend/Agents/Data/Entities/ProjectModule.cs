namespace Agents.Data.Entities
{
    /// <summary>
    /// A single identified software module for a conversation's project.
    /// The full set is replaced whenever the modules estimation runs again.
    /// </summary>
    public class ProjectModule
    {
        public int Id { get; set; }

        public string ConversationId { get; set; } = string.Empty;

        public string ProjectId { get; set; } = string.Empty;

        public string ModuleName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public bool IsRequired { get; set; }

        /// <summary>Dependency module names, persisted as JSON.</summary>
        public List<string> Dependencies { get; set; } = new();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Conversation? Conversation { get; set; }
    }
}
