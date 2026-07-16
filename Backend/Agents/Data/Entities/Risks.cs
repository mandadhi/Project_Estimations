namespace Agents.Data.Entities
{
    public class Risk
    {
        public int Id { get; set; }

        public string ConversationId { get; set; } = string.Empty;

        public string ProjectId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;

        public string MitigationPlan { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }


        // Navigation
        public Conversation? Conversation { get; set; }
    }
}