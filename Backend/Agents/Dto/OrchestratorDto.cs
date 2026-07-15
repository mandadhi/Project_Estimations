namespace Agents.Dto
{
    public class OrchestrateRequestDto
    {
        public string conversation_id { get; set; } = string.Empty;

        public string project_id { get; set; } = string.Empty;

        public string message { get; set; } = string.Empty;
    }

    /// <summary>
    /// Uniform orchestrator reply the frontend can render. <c>tool_invoked</c> tells
    /// the UI which tool ran (null when none applied); <c>kind</c> describes the
    /// payload sitting in <c>data</c>.
    /// </summary>
    public class OrchestratorResponse
    {
        /// <summary>analyze_requirements | estimate_modules | null</summary>
        public string? tool_invoked { get; set; }

        /// <summary>Assistant text to show in the chat thread.</summary>
        public string message { get; set; } = string.Empty;

        /// <summary>Payload kind: text | requirements | modules.</summary>
        public string kind { get; set; } = "text";

        /// <summary>Structured payload: ProjectChatResponse, ModuleEstimationDto, or null.</summary>
        public object? data { get; set; }
    }
}
