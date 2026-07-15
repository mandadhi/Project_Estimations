using Microsoft.AspNetCore.Mvc;
using Agents.Dto;
using Agents.Services;

namespace Orchestration
{
    /// <summary>
    /// Orchestrator endpoint. Takes a single user message, routes it to the
    /// requirements-analysis or modules-estimation tool (or neither), persists the
    /// turn + any structured result, and returns a uniform chat-friendly response.
    /// </summary>
    [ApiController]
    [Route("project")]
    public class OrchestratorController : ControllerBase
    {
        private readonly IOrchestratorService _orchestrator;
        private readonly IChatHistoryService _history;

        public OrchestratorController(
            IOrchestratorService orchestrator,
            IChatHistoryService history)
        {
            _orchestrator = orchestrator;
            _history = history;
        }

        [HttpPost("orchestrate")]
        public async Task<IActionResult> Orchestrate([FromBody] OrchestrateRequestDto request)
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

                // Persist the user's turn before running the orchestrator.
                await _history.AddMessageAsync(request.conversation_id, "user", request.message);

                var result = await _orchestrator.RunAsync(
                    request.conversation_id, request.project_id, request.message);

                // Persist any completed requirements / modules produced by the tools.
                if (result.Requirements?.IsMatched == true && result.Requirements.ProjectDetails is not null)
                {
                    await _history.SaveRequirementsAsync(
                        request.conversation_id, result.Requirements.ProjectDetails);
                }

                if (result.Modules is not null)
                {
                    await _history.SaveModulesAsync(request.conversation_id, result.Modules.modules);
                }

                // Persist the assistant reply for history replay.
                await _history.AddMessageAsync(
                    request.conversation_id,
                    "assistant",
                    result.Response.message,
                    result.Response.kind);

                return Ok(result.Response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    error = "Unexpected error while orchestrating the request",
                    details = ex.Message
                });
            }
        }
    }
}
