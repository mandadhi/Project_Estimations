using Microsoft.AspNetCore.Mvc;
using Agents.Services;
using ProjectChatRequest;

namespace ProjectRequirements
{
    /// <summary>
    /// Requirements-gathering chat endpoint. Thin controller: delegates the agent
    /// work to <see cref="IRequirementsService"/> and persistence to
    /// <see cref="IChatHistoryService"/>.
    /// </summary>
    [ApiController]
    [Route("project")]
    public class ProjectChat : ControllerBase
    {
        private readonly IRequirementsService _requirementsService;
        private readonly IChatHistoryService _history;

        public ProjectChat(
            IRequirementsService requirementsService,
            IChatHistoryService history)
        {
            _requirementsService = requirementsService;
            _history = history;
        }

        [HttpPost("chat")]
        public async Task<IActionResult> ProjectRequirements(
            [FromBody] ProjectChatRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.conversation_id))
            {
                return BadRequest(new { error = "conversation_id is required" });
            }

            if (string.IsNullOrWhiteSpace(request.message))
            {
                return BadRequest(new { error = "message is required" });
            }

            try
            {
                await _history.EnsureConversationAsync(request.conversation_id, request.project_id);
                await _history.AddMessageAsync(
                    request.conversation_id, "user", request.message);

                var result = await _requirementsService.AnalyzeAsync(
                    request.conversation_id, request.project_id, request.message);

                if (!result.Success || result.Value is null)
                {
                    // Agent replied but the text wasn't valid JSON. Preserve the
                    // original contract: 200 with an error envelope.
                    return Ok(new
                    {
                        error = result.Error,
                        details = result.ErrorDetails,
                        res_msg = result.RawText
                    });
                }

                var response = result.Value;

                // Persist the assistant reply, then upsert requirements when complete.
                await _history.AddMessageAsync(
                    request.conversation_id, "assistant", response.Response,
                    response.IsMatched ? "requirements" : "text");

                if (response.IsMatched && response.ProjectDetails is not null)
                {
                    await _history.SaveRequirementsAsync(
                        request.conversation_id, response.ProjectDetails);
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    error = "Unexpected error while processing project requirements",
                    details = ex.Message
                });
            }
        }
    }
}
