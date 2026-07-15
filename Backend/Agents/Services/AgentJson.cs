using System.Text.Json;

namespace Agents.Services
{
    /// <summary>
    /// Helpers for turning raw agent text output into typed DTOs. Models frequently
    /// wrap JSON in markdown code fences, so we strip those before deserializing.
    /// </summary>
    public static class AgentJson
    {
        public static readonly JsonSerializerOptions Options = new()
        {
            PropertyNameCaseInsensitive = true
        };

        /// <summary>Removes ```json / ``` fences and trims surrounding whitespace.</summary>
        public static string StripFences(string? text)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                return string.Empty;
            }

            return text
                .Replace("```json", string.Empty)
                .Replace("```", string.Empty)
                .Trim();
        }

        /// <summary>
        /// Deserializes fence-stripped agent output into <typeparamref name="T"/>.
        /// Throws <see cref="JsonException"/> on invalid JSON so callers can surface it.
        /// </summary>
        public static T? Deserialize<T>(string? rawText)
        {
            var json = StripFences(rawText);
            return JsonSerializer.Deserialize<T>(json, Options);
        }

        /// <summary>
        /// Attempts to deserialize fence-stripped agent output; returns null on any
        /// parse failure instead of throwing, for callers that treat bad JSON as a
        /// recoverable outcome.
        /// </summary>
        public static T? TryDeserialize<T>(string? rawText)
        {
            try
            {
                return Deserialize<T>(rawText);
            }
            catch (JsonException)
            {
                return default;
            }
        }
    }
}
