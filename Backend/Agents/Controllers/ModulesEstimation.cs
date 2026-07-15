using Microsoft.AspNetCore.Mvc;
using Agents.Services;
using ProjectChat;

namespace ModuleEstimation
{
    /// <summary>
    /// Modules-estimation endpoint. Thin controller: delegates agent work to
    /// <see cref="IModulesService"/> and persistence to <see cref="IChatHistoryService"/>.
    /// </summary>
    [ApiController]
    [Route("project")]
    public class ModuleEstimationAgent : ControllerBase
    {
        private readonly IModulesService _modulesService;
        private readonly IChatHistoryService _history;

        public ModuleEstimationAgent(
            IModulesService modulesService,
            IChatHistoryService history)
        {
            _modulesService = modulesService;
            _history = history;
        }

        [HttpPost("modules")]
        public async Task<IActionResult> ModuleEstimationRoute(
            [FromBody] ProjectChatResponse chatResponse)
        {
            if (string.IsNullOrWhiteSpace(chatResponse.conversation_id))
            {
                return BadRequest(new { error = "conversation_id is required" });
            }

            if (chatResponse.ProjectDetails is null)
            {
                return BadRequest(new { error = "projectDetails is required" });
            }

            try
            {
                await _history.EnsureConversationAsync(
                    chatResponse.conversation_id, chatResponse.project_id);

                var result = await _modulesService.EstimateAsync(chatResponse);

                if (!result.Success || result.Value is null)
                {
                    return Ok(new
                    {
                        error = result.Error,
                        details = result.ErrorDetails,
                        res_msg = result.RawText
                    });
                }

                var modules = result.Value;

                await _history.SaveModulesAsync(chatResponse.conversation_id, modules.modules);
                await _history.AddMessageAsync(
                    chatResponse.conversation_id,
                    "assistant",
                    $"Identified {modules.modules.Count} module{(modules.modules.Count == 1 ? "" : "s")} for your project.",
                    "modules");

                return Ok(modules);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    error = "Unexpected error while processing module estimation",
                    details = ex.Message
                });
            }
        }
    }
}
