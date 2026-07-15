namespace ModuleEstimation
{
    public class ModuleEstimationDto
    {


        public string conversation_id { get; set; } = string.Empty;

        public string project_id { get; set; } = string.Empty;
        public List<ModuleDto> modules { get; set; } = new();
    }

    public class ModuleDto
    {
        public string module_name { get; set; } = string.Empty;

        public string description { get; set; } = string.Empty;

        public bool is_required { get; set; }

        public List<string> dependencies { get; set; } = new();
    }
}