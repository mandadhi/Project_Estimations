using Microsoft.AspNetCore.Mvc;
using Agents.Services;
using ProjectChat;
namespace Agents.Controllers
{
    [ApiController]
    [Route("project")]
    public class RisksController : ControllerBase
    {
        private readonly IRiskService _riskService;
        private readonly IChatHistoryService _history;

        public RisksController(
            IRiskService riskService,
            IChatHistoryService history)
        {
            _riskService = riskService;
            _history = history;
        }

        [HttpPost("risks")]
        public async Task<IActionResult> EstimateRisks(
            [FromBody] ProjectChatResponse chatResponse)
        {
            if (string.IsNullOrWhiteSpace(chatResponse.conversation_id))
            {
                return BadRequest(new { error = "conversation_id is required" });
            }

           if(chatResponse.ProjectDetails is null)
            {
                return BadRequest(new { error = "projectDetails is required" });
            }

            try
            {
                await _history.EnsureConversationAsync(
                    chatResponse.conversation_id, chatResponse.project_id);

                var result = await _riskService.EstimateAsync(chatResponse);

                if (!result.Success || result.Value is null)
                {
                    return Ok(new
                    {
                        error = result.Error,
                        details = result.ErrorDetails,
                        res_msg = result.RawText
                    });
                }

                var risks = result.Value;

                await _riskService.SaveRisksAsync(chatResponse.conversation_id, chatResponse.project_id, risks.Risks);
                await _history.AddMessageAsync(
                    chatResponse.conversation_id,
                    "assistant",
                    $"Identified {risks.Risks.Count} risk{(risks.Risks.Count == 1 ? "" : "s")} for your project.",
                    "risks");

                return Ok(risks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    error = "Unexpected error while processing risk estimation",
                    details = ex.Message
                });
            }
        }
    }
}