namespace Agents.Data.Entities
{
    /// <summary>
    /// A single message in a conversation. Persisted so the frontend can
    /// reload full chat history for a conversation.
    /// </summary>
    public class ChatMessage
    {
        public int Id { get; set; }

        public string ConversationId { get; set; } = string.Empty;

        /// <summary>user | assistant | system</summary>
        public string Role { get; set; } = "user";

        public string Content { get; set; } = string.Empty;

        /// <summary>
        /// Semantic kind of the message payload: text | requirements | modules.
        /// Lets the frontend render structured cards for non-plain messages.
        /// </summary>
        public string Kind { get; set; } = "text";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Conversation? Conversation { get; set; }
    }
}
