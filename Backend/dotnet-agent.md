# .NET Backend Agent Guide

Context for working on the **Project Estimations** backend — an ASP.NET Core service that runs AI agents to turn a conversation into a project estimate.

## Stack

- **Runtime:** .NET 10 (`net10.0`), `Nullable` + `ImplicitUsings` enabled
- **Framework:** ASP.NET Core, Minimal Hosting model + controller-based routing
- **Key packages:**
  - `Microsoft.Agents.AI` (1.13.0) — `AIAgent`, `AgentSession`, `AgentResponse`
  - `Microsoft.Extensions.AI` (10.7.0) — `IChatClient` abstraction
  - `Microsoft.Extensions.AI.OpenAI` (10.7.0) — OpenAI-compatible client
  - `Microsoft.EntityFrameworkCore.Sqlite` — SQLite persistence
  - `Microsoft.AspNetCore.OpenApi` (10.0.9)
- **Tests:** `Agents.Tests` (xUnit) using `WebApplicationFactory<Program>`, an in-memory EF database, and a deterministic `FakeChatClient` — no network calls.

## Layout

```
Backend/
├── Agents/
│   ├── Agents.csproj             # .NET 10 web SDK project
│   ├── Program.cs                # entry point, DI, CORS, DbContext + chat-client setup
│   ├── appsettings.json          # config (OpenRouter + ConnectionStrings sections)
│   ├── Controllers/              # thin — validate input, call a service, persist, return
│   │   ├── ProjectChatRequirements.cs   # POST /project/chat
│   │   ├── ModulesEstimation.cs         # POST /project/modules
│   │   ├── OrchestratorController.cs    # POST /project/orchestrate
│   │   └── HistoryController.cs         # GET /project/{id}/history, GET /project/{id}
│   ├── Agents/
│   │   └── AgentDefinitions.cs   # agent names + system instructions (Requirements, Modules, Orchestrator)
│   ├── Dto/
│   │   ├── ProjectChatRequest.cs        # request DTO
│   │   ├── ProjectChatResponse.cs       # response DTO + ProjectDetails
│   │   ├── ModuleEstimationDtoResponse.cs
│   │   ├── OrchestratorDto.cs           # OrchestrateRequestDto + OrchestratorResponse
│   │   └── AgentResult.cs               # generic Ok/Invalid result wrapper
│   ├── Data/
│   │   ├── AppDbContext.cs              # EF Core context (Conversations, Messages, Requirements, Modules)
│   │   └── Entities/                    # Conversation, ChatMessage, ProjectRequirement, ProjectModule
│   └── Services/
│       ├── SessionManager.cs            # in-memory AgentSessionManager (singleton)
│       ├── RequirementsService.cs       # Business Analyst agent
│       ├── ModulesService.cs            # Software Solution Architect agent
│       ├── OrchestratorService.cs       # tool-calling router + deterministic fallback
│       └── ChatHistoryService.cs        # persistence (upsert requirements/modules, read history)
└── Agents.Tests/                # xUnit integration tests (FakeChatClient + in-memory EF)
```

**Architecture:** controllers are thin; all agent work lives in `Services/*`, and all persistence
lives in `ChatHistoryService`. Agents are created from the singleton `IChatClient` via `AsAIAgent`
with instructions from `AgentDefinitions`. State is persisted to **SQLite via EF Core**
(`db.Database.EnsureCreated()` on startup — no migrations), plus in-memory `AgentSession`s keyed by
`conversation_id`.

## Run

```powershell
cd Backend/Agents
dotnet run
```

- HTTP: `http://localhost:5118`
- HTTPS: `https://localhost:7005`
- Environment: `Development`

The frontend (Vite) proxies `/api/*` to `http://localhost:5118` and expects CORS origin `http://localhost:5173` (configured in `Program.cs`).

## Endpoints

All are under the `/project` prefix. Every turn is persisted (messages, and the requirements/module snapshots).

### `POST /project/chat`
Conversational requirement-gathering. A "Business Analyst" agent decides whether enough info exists to start estimation.

Request:
```json
{ "conversation_id": "string", "project_id": "string", "message": "string" }
```

Response (`ProjectChatResponse`):
```json
{
  "isMatched": true,
  "response": "message for user",
  "projectDetails": {
    "projectObjective": "...", "scope": ["..."], "platform": "...",
    "technologyStack": ["..."], "integrations": ["..."], "userRoles": ["..."],
    "expectedUsers": "...", "securityRequirements": ["..."],
    "performanceRequirements": "...", "availabilityRequirements": "..."
  },
  "missingRequirements": ["..."]
}
```
When incomplete: `isMatched=false`, `projectDetails=null`, `missingRequirements` populated. Empty `conversation_id`/`message` → `400`.

### `POST /project/modules`
Takes a completed `ProjectChatResponse` and runs a "Software Solution Architect" agent that decomposes `ProjectDetails` into modules. It identifies modules only — it does **not** estimate effort/timeline/cost.

Response (`ModuleEstimationDto`):
```json
{
  "conversation_id": "string",
  "project_id": "string",
  "modules": [
    { "module_name": "Authentication", "description": "...", "is_required": true, "dependencies": ["..."] }
  ]
}
```

### `POST /project/orchestrate`
Single entry point for a chat UI. Takes one user message and routes it to the right tool
(`analyze_requirements` or `estimate_modules`) via `OrchestratorService`, or replies with plain
text when neither applies. Persists the turn and any produced requirements/modules.

Request:
```json
{ "conversation_id": "string", "project_id": "string", "message": "string" }
```

Response (`OrchestratorResponse`):
```json
{
  "tool_invoked": "analyze_requirements",   // or "estimate_modules" or null
  "message": "assistant text for the thread",
  "kind": "requirements",                    // text | requirements | modules
  "data": { }                                // ProjectChatResponse, ModuleEstimationDto, or null
}
```

The orchestrator prefers the model's native tool-calling, but the free Gemma model often can't emit
tool calls — so `OrchestratorService` has a **deterministic keyword router** fallback that picks the
tool from the message + whether requirements are already complete. Tests exercise this fallback path.

### `GET /project/{conversationId}/history`
Ordered chat messages for replaying a conversation in the UI: `{ conversation_id, messages: [{ id, role, content, kind, created_at }] }`. Unknown id → empty list.

### `GET /project/{conversationId}`
Full snapshot: `{ conversation_id, project_id, created_at, updated_at, requirements, modules }`. Unknown id → `404`.

### Error handling
- Malformed AI JSON → `200 OK` with `{ error, details, res_msg }` (preserves the original contract).
- Missing `conversation_id`/`message` → `400`.
- Other exceptions → `500`.

Responses from the model are wrapped in markdown code fences; `AgentJson.TryDeserialize` strips the fences before `JsonSerializer.Deserialize`.

## Conventions

- **Thin controllers:** validate → call a `Services/*` method → persist via `ChatHistoryService` → return. No agent logic in controllers.
- Services deserialize the agent's text output into DTOs — keep DTO shapes and the agent prompts (`AgentDefinitions`) in sync when changing either.
- Sessions come from the singleton `AgentSessionManager`; reuse a session per `conversation_id`.
- The chat client (`IChatClient`) is a singleton; services are scoped, `ChatHistoryService` owns all DB writes.

## Testing

```powershell
dotnet test Backend/Agents.Tests
```

`Agents.Tests` boots the real HTTP pipeline with `WebApplicationFactory<Program>`, swapping in an
in-memory EF database and a deterministic `FakeChatClient` (returns canned JSON based on which agent's
instructions it sees). No OpenRouter calls, fully repeatable. `Program.cs` exposes `public partial class
Program` so the factory can reference it. Manual smoke tests live in `Agents/Agents.http`.

## Known issues to address

- **Hardcoded secret:** the OpenRouter API key is still a literal fallback in `Program.cs`. It now reads
  `OpenRouter:ApiKey`/`OpenRouter:Model` from config first, but the committed key must be rotated and the
  fallback removed before any non-local use.
- **No auth:** no authentication/authorization on any endpoint. Add it before any non-local deployment.
- **EnsureCreated, not migrations:** the schema is created via `EnsureCreated()`. Switch to EF migrations
  before evolving the schema in an environment with existing data.
