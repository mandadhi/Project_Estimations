using System.Runtime.CompilerServices;
using Microsoft.Extensions.AI;

namespace Agents.Tests
{
    /// <summary>
    /// Deterministic in-memory <see cref="IChatClient"/> for tests. Inspects the
    /// system instructions to decide which canned JSON to return, so tests never
    /// touch OpenRouter and are fully repeatable.
    ///
    /// Because it returns plain text (no tool calls), the orchestrator exercises its
    /// deterministic-router fallback — which is exactly the path the free Gemma model
    /// takes in production.
    /// </summary>
    public class FakeChatClient : IChatClient
    {
        /// <summary>When true, the requirements agent reports a complete match.</summary>
        public bool RequirementsMatched { get; set; } = false;

        /// <summary>When true, agents return text that is NOT valid JSON.</summary>
        public bool ReturnInvalidJson { get; set; } = false;

        private string BuildReply(IEnumerable<ChatMessage> messages, ChatOptions? options)
        {
            // The agent framework passes agent instructions via ChatOptions.Instructions,
            // not as a chat message — so inspect both to decide which agent is calling.
            var all = string.Join("\n", messages.Select(m => m.Text));
            if (!string.IsNullOrEmpty(options?.Instructions))
            {
                all += "\n" + options!.Instructions;
            }

            if (ReturnInvalidJson)
            {
                return "not-json at all";
            }

            // Modules agent
            if (all.Contains("Software Solution Architect"))
            {
                return """
                {
                  "conversation_id": "",
                  "project_id": "",
                  "modules": [
                    { "module_name": "Authentication", "description": "Login and identity.", "is_required": true, "dependencies": [] },
                    { "module_name": "Authorization", "description": "Role-based access.", "is_required": true, "dependencies": ["Authentication"] }
                  ]
                }
                """;
            }

            // Requirements agent
            if (all.Contains("Business Analyst"))
            {
                if (RequirementsMatched)
                {
                    return """
                    {
                      "isMatched": true,
                      "response": "Great, I have everything I need.",
                      "projectDetails": {
                        "projectObjective": "Build an online store",
                        "scope": ["catalog", "cart"],
                        "platform": "Web",
                        "technologyStack": ["React", "ASP.NET"],
                        "integrations": ["Stripe"],
                        "userRoles": ["customer", "admin"],
                        "expectedUsers": "10000",
                        "securityRequirements": ["OAuth2"],
                        "performanceRequirements": "p95 < 300ms",
                        "availabilityRequirements": "99.9%"
                      },
                      "missingRequirements": []
                    }
                    """;
                }

                return """
                {
                  "isMatched": false,
                  "response": "Tell me more about your project.",
                  "projectDetails": null,
                  "missingRequirements": ["project objective", "platform"]
                }
                """;
            }

            // Orchestrator agent (or anything else): a plain assistant message.
            return "I can analyze requirements or estimate modules. What would you like?";
        }

        public Task<ChatResponse> GetResponseAsync(
            IEnumerable<ChatMessage> messages,
            ChatOptions? options = null,
            CancellationToken cancellationToken = default)
        {
            var reply = BuildReply(messages, options);
            var response = new ChatResponse(new ChatMessage(ChatRole.Assistant, reply));
            return Task.FromResult(response);
        }

        public async IAsyncEnumerable<ChatResponseUpdate> GetStreamingResponseAsync(
            IEnumerable<ChatMessage> messages,
            ChatOptions? options = null,
            [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            var reply = BuildReply(messages, options);
            yield return new ChatResponseUpdate(ChatRole.Assistant, reply);
            await Task.CompletedTask;
        }

        public object? GetService(Type serviceType, object? serviceKey = null) => null;

        public void Dispose() { }
    }
}
