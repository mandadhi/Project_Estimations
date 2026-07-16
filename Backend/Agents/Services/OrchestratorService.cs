using System.ComponentModel;
using System.Text.Json;
using Microsoft.Agents.AI;
using Microsoft.Extensions.AI;
using Agents.Agents;
using Agents.Dto;
using ModuleEstimation;
using ProjectChat;
using SessionManager;

namespace Agents.Services
{
    public interface IOrchestratorService
    {
        /// <summary>
        /// Takes a user message and routes it to the correct registered tool
        /// (requirements analysis or modules estimation). If no tool applies,
        /// returns a plain assistant message. Persistence is handled by the caller
        /// via the returned typed payload.
        /// </summary>
        Task<OrchestratorResult> RunAsync(
            string conversationId,
            string projectId,
            string message,
            CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// Internal outcome of orchestration carrying both the client-facing response
    /// and the typed payloads the controller needs to persist.
    /// </summary>
    public class OrchestratorResult
    {
        public OrchestratorResponse Response { get; init; } = new();

        /// <summary>Set when the requirements tool ran and parsed successfully.</summary>
        public ProjectChatResponse? Requirements { get; init; }

        /// <summary>Set when the modules tool ran and parsed successfully.</summary>
        public ModuleEstimationDto? Modules { get; init; }

        /// <summary>Set when the risks tool ran and parsed successfully.</summary>
        public RiskEstimationDtoResponse? Risks { get; init; }
    }

    public class OrchestratorService : IOrchestratorService
    {
        private readonly IChatClient _chatClient;
        private readonly IRequirementsService _requirementsService;
        private readonly IModulesService _modulesService;
        private readonly IChatHistoryService _history;
        private readonly AgentSessionManager _sessionManager;

        private readonly IRiskService _riskService;

        // Tool identifiers, also used as the deterministic router's decision values.
        private const string RequirementsTool = "analyze_requirements";
        private const string ModulesTool = "estimate_modules";

        private const string RisksTool = "analyze_risks";

        public OrchestratorService(
            IChatClient chatClient,
            IRequirementsService requirementsService,
            IModulesService modulesService,
            IChatHistoryService history,
            AgentSessionManager sessionManager,
            IRiskService riskService)
        {
            _chatClient = chatClient;
            _requirementsService = requirementsService;
            _modulesService = modulesService;
            _history = history;
            _sessionManager = sessionManager;
            _riskService = riskService;
        }

        public async Task<OrchestratorResult> RunAsync(
            string conversationId,
            string projectId,
            string message,
            CancellationToken cancellationToken = default)
        {
            // Captured tool outputs. The tool delegates record their own invocation
            // so we know what ran regardless of how the model/framework behaves.
            ProjectChatResponse? requirementsResult = null;
            ModuleEstimationDto? modulesResult = null;
            RiskEstimationDtoResponse? risksResult = null;
            string? invokedTool = null;

            async Task<string> RunRequirementsTool(string userMessage)
            {
                invokedTool = RequirementsTool;
                var result = await _requirementsService.AnalyzeAsync(
                    conversationId, projectId, userMessage, cancellationToken);
                if (result.Success && result.Value is not null)
                {
                    requirementsResult = result.Value;
                    return JsonSerializer.Serialize(result.Value);
                }
                return result.RawText ?? "{}";
            }

            async Task<string> RunModulesTool()
            {
                invokedTool = ModulesTool;
                // Modules estimation needs completed requirements — load the latest snapshot.
                var details = await _requirementsService.GetRequirementsAsync(conversationId, projectId, cancellationToken);
                if (details is null)
                {
                    return "{\"error\":\"No completed requirements found for this conversation.\"}";
                }
                var result = await _modulesService.EstimateAsync(
                    conversationId, projectId, details, cancellationToken);
                if (result.Success && result.Value is not null)
                {
                    modulesResult = result.Value;
                    return JsonSerializer.Serialize(result.Value);
                }
                return result.RawText ?? "{}";
            }


            async Task<string> RunRisksTool()
            {
                invokedTool = RisksTool;
                var details = await _requirementsService.GetRequirementsAsync(conversationId, projectId, cancellationToken);
                if (details is null)
                {
                    return "{\"error\":\"No completed requirements found for this conversation.\"}";
                }
                var result = await _riskService.EstimateAsync(
                    conversationId, projectId, details, cancellationToken);
                if (result.Success && result.Value is not null)
                {
                    risksResult = result.Value;
                    return JsonSerializer.Serialize(result.Value);
                }
                return result.RawText ?? "{}";
            }

            // Register the two services as callable tools.
            var tools = new List<AITool>
            {
                AIFunctionFactory.Create(
                    (Func<string, Task<string>>)(userMessage => RunRequirementsTool(userMessage)),
                    name: RequirementsTool,
                    description: "Analyze the user's project requirements and determine whether enough " +
                                 "information exists to begin estimation. Use for gathering or describing " +
                                 "project requirements, scope, platform, or technology."),
                AIFunctionFactory.Create(
                    (Func<Task<string>>)(() => RunModulesTool()),
                    name: ModulesTool,
                    description: "Break the completed project requirements into the list of software modules. " +
                                 "Use only when requirements are complete and the user wants modules, " +
                                 "estimation, or to proceed."),
                AIFunctionFactory.Create(
                    (Func<Task<string>>)(() => RunRisksTool()),
                    name: RisksTool,
                    description: "Analyze the completed project requirements and determine potential risks. " +
                                 "Use only when requirements are complete and the user wants to understand " +
                                 "potential risks for the project."),
            };

            // 1) Attempt LLM-driven tool selection.
            string assistantText;
            try
            {
                AIAgent agent = _chatClient.AsAIAgent(
                    name: AgentDefinitions.OrchestratorAgentName,
                    instructions: AgentDefinitions.OrchestratorInstructions);

                if (!_sessionManager.TryGetSession(OrchestratorKey(conversationId), out AgentSession? session))
                {
                    session = await agent.CreateSessionAsync();
                    _sessionManager.AddSession(OrchestratorKey(conversationId), session);
                }

                var runOptions = new ChatClientAgentRunOptions(new ChatOptions { Tools = tools });
                AgentResponse response = await agent.RunAsync(message, session: session, options: runOptions);
                assistantText = response.Text ?? string.Empty;
            }
            catch (Exception)
            {
                // Model/framework couldn't handle tool-calling — fall through to the router.
                assistantText = string.Empty;
            }

            // 2) Deterministic fallback: if no tool was invoked by the model, route ourselves.
            if (invokedTool is null)
            {
                var routed = await RouteDeterministicallyAsync(conversationId, projectId, message, cancellationToken);
                if (routed == RequirementsTool)
                {
                    await RunRequirementsTool(message);
                }
                else if (routed == ModulesTool)
                {
                    await RunModulesTool();
                }
                else if (routed == RisksTool)
                {
                    await RunRisksTool();
                }
                // routed == null → no tool applies; keep the assistant's own message.
            }

            return BuildResult(invokedTool, requirementsResult, modulesResult, risksResult, assistantText);
        }

        /// <summary>
        /// Heuristic router used when the model emits no tool call. Chooses modules
        /// only when requirements are already complete AND the message signals intent
        /// to proceed/estimate; otherwise defaults to requirements analysis.
        /// </summary>
        private async Task<string?> RouteDeterministicallyAsync(
            string conversationId, string projectId, string message, CancellationToken ct)
        {
            var text = message.ToLowerInvariant();

            string[] moduleSignals =
            {
                "module", "estimate", "estimation", "proceed", "continue",
                "break down", "decompose", "next step", "go ahead"
            };

            string[] riskSignals =
            {
                "risk", "risks", "danger", "threat", "problem", "issue", "concern"
            };

            bool wantsModules = moduleSignals.Any(text.Contains);

            bool wantsRisks = riskSignals.Any(text.Contains);

            bool requirementsReady = await _requirementsService.GetRequirementsAsync(conversationId, projectId, ct) is not null;

            if (wantsModules && requirementsReady)
            {
                return ModulesTool;
            }
            if (wantsRisks && requirementsReady)
            {
                return RisksTool;
            }

            // Default: treat the turn as requirements gathering. This is the safe
            // path — the requirements agent itself decides matched/unmatched.
            return RequirementsTool;
        }

        private static OrchestratorResult BuildResult(
            string? invokedTool,
            ProjectChatResponse? requirements,
            ModuleEstimationDto? modules,
            RiskEstimationDtoResponse? risks,
            string assistantText)
        {
            if (invokedTool == RequirementsTool && requirements is not null)
            {
                return new OrchestratorResult
                {
                    Requirements = requirements,
                    Response = new OrchestratorResponse
                    {
                        tool_invoked = RequirementsTool,
                        message = string.IsNullOrWhiteSpace(requirements.Response)
                            ? "Analyzed your project requirements."
                            : requirements.Response,
                        kind = "requirements",
                        data = requirements,
                    }
                };
            }

            if (invokedTool == ModulesTool && modules is not null)
            {
                int count = modules.modules?.Count ?? 0;
                return new OrchestratorResult
                {
                    Modules = modules,
                    Response = new OrchestratorResponse
                    {
                        tool_invoked = ModulesTool,
                        message = $"Identified {count} module{(count == 1 ? "" : "s")} for your project.",
                        kind = "modules",
                        data = modules,
                    }
                };
            }


            if (invokedTool == RisksTool && risks is not null)
            {
                int count = risks.Risks?.Count ?? 0;
                return new OrchestratorResult
                {
                    Risks = risks,
                    Response = new OrchestratorResponse
                    {
                        tool_invoked = RisksTool,
                        message = $"Identified {count} potential risk{(count == 1 ? "" : "s")} for your project.",
                        kind = "risks",
                        data = risks,
                    }
                };
            }


            // No tool applied (or tool failed to parse) — return the assistant's message.
            return new OrchestratorResult
            {
                Response = new OrchestratorResponse
                {
                    tool_invoked = null,
                    message = string.IsNullOrWhiteSpace(assistantText)
                        ? "I couldn't determine an action for that. Could you describe your project " +
                          "requirements, or ask me to estimate the modules?"
                        : assistantText,
                    kind = "text",
                    data = null,
                }
            };
        }

        private static string OrchestratorKey(string conversationId) => $"orchestrator::{conversationId}";
    }
}
