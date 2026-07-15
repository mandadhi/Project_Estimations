namespace Agents.Services
{
    /// <summary>
    /// Outcome of running an agent-backed service. Distinguishes a clean typed
    /// result from an invalid-JSON case (agent replied but not parseable) so the
    /// controller can choose the right HTTP shape without throwing.
    /// </summary>
    public class AgentResult<T>
    {
        public bool Success { get; init; }

        public T? Value { get; init; }

        /// <summary>Set when the agent returned text that failed JSON parsing.</summary>
        public string? Error { get; init; }

        public string? ErrorDetails { get; init; }

        /// <summary>Raw agent text, retained for diagnostics on parse failure.</summary>
        public string? RawText { get; init; }

        public static AgentResult<T> Ok(T value, string? rawText = null) => new()
        {
            Success = true,
            Value = value,
            RawText = rawText
        };

        public static AgentResult<T> Invalid(string error, string details, string? rawText) => new()
        {
            Success = false,
            Error = error,
            ErrorDetails = details,
            RawText = rawText
        };
    }
}
