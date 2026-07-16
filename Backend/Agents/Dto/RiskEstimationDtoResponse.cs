namespace Agents.Dto
{
    public class RiskEstimationDtoResponse
    {
        public string ConversationId { get; set; } = string.Empty;

        public string ProjectId { get; set; } = string.Empty;

        public List<RiskDto> Risks { get; set; } = new();
    }

    public class RiskDto
    {
        public string RiskName { get; set; } = string.Empty;
        public string RiskDescription { get; set; } = string.Empty;

        public string Severity { get; set; } = string.Empty;

        public string MitigationStrategy { get; set; } = string.Empty;
    }
}