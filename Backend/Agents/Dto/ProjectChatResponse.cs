namespace ProjectChat
{
    public class ProjectChatResponse
    {   
        public string conversation_id {get; set;} = string.Empty;

        public string project_id {get; set; } = string.Empty;
        public bool IsMatched { get; set; }

        public string Response { get; set; } = string.Empty;

        public ProjectDetails? ProjectDetails { get; set; }

        public List<string> MissingRequirements { get; set; } = new();
    }


    public class ProjectDetails
    {
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
    }
}