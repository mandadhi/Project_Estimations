# High-Level Design — Project Estimation & Proposal Assistant

**Version:** 1.0  ·  **Date:** 2026-07-16  ·  **Status:** Draft

## 1. Purpose & Scope

The Project Estimation & Proposal Assistant is an AI-powered platform that turns a
conversational description of a software project into a structured estimate and a
client-ready proposal. A user describes their project in chat; a pipeline of AI agents
gathers requirements, decomposes the project into modules, generates user stories and
subtasks, assesses complexity, rolls up effort into a total estimate with a risk buffer,
and finally compiles a proposal document.

This document describes the system at the architectural level: contexts, containers,
components, key flows, and cross-cutting concerns (security per OWASP Top 10, observability,
deployment). Detailed class/sequence design is in `LLD_document.md`.

## 2. Architecture Principles

- **Thin controllers, service-driven logic.** Controllers validate and delegate; services own agent orchestration and persistence.
- **Server-authoritative state.** Persistence decisions (isMatched, totals) are derived server-side, never trusted from the client.
- **Model output is data, never code.** LLM responses are parsed, validated, and rendered/persisted — never executed.
- **Stateless HTTP, session-scoped AI context.** Conversation continuity is keyed by `conversationId`; agent sessions live in an in-memory manager.
- **Security by default (OWASP-aligned).** AuthN/AuthZ, input validation, secrets management, and safe error handling are first-class.

## 3. System Context (C4 Level 1)

```mermaid
graph TB
    User([Project Manager / Estimator])
    Client([Client / Stakeholder])

    subgraph System["Project Estimation & Proposal Assistant"]
        App[Web Application]
    end

    LLM[OpenRouter LLM API<br/>OpenAI-compatible]
    Mail[Email Provider<br/>password reset]
    Store[(Persistent Store)]

    User -->|describes project, reviews estimates, edits proposal| App
    App -->|generated proposal / export| Client
    App -->|prompts, requirement & estimation calls| LLM
    LLM -->|structured JSON responses| App
    App -->|reset links| Mail
    App -->|read/write| Store

    classDef ext fill:#eee,stroke:#999,color:#333;
    class LLM,Mail,Store ext;
```

## 4. Container View (C4 Level 2)

```mermaid
graph TB
    subgraph Browser["Browser — SPA"]
        FE[React + Vite + Tailwind<br/>Chat, Modules, Assumptions,<br/>Risks, Review/Export]
    end

    subgraph Server["ASP.NET Core (.NET 10) API"]
        CTRL[Controllers<br/>Orchestrator, ProjectChat,<br/>ModuleEstimation, History]
        SVC[Application Services<br/>Orchestrator, Requirements,<br/>Modules, ChatHistory]
        SESS[AgentSessionManager<br/>in-memory sessions]
        EF[EF Core AppDbContext]
    end

    DB[(SQLite / RDBMS)]
    LLM[OpenRouter LLM]

    FE -->|/api proxy — REST/JSON| CTRL
    CTRL --> SVC
    SVC --> SESS
    SVC --> EF
    SVC -->|IChatClient| LLM
    EF --> DB

    classDef ext fill:#eee,stroke:#999,color:#333;
    class DB,LLM ext;
```

**Notes**
- The Vite dev server proxies `/api/*` to the backend (`localhost:5118`), rewriting the prefix.
- `IChatClient` is a singleton wrapping the OpenRouter (OpenAI-compatible) endpoint.
- SQLite is used today (`EnsureCreated` on startup); the schema is portable to a server RDBMS for production.

## 5. Component View — Backend

```mermaid
graph LR
    subgraph Controllers
        OC[OrchestratorController<br/>POST /project/orchestrate]
        PC[ProjectChat<br/>POST /project/chat]
        ME[ModuleEstimationAgent<br/>POST /project/modules]
        HC[HistoryController<br/>GET /project/&#123;id&#125;/history<br/>GET /project/&#123;id&#125;]
    end

    subgraph Services
        OS[OrchestratorService]
        RS[RequirementsService]
        MS[ModulesService]
        CHS[ChatHistoryService]
    end

    ASM[AgentSessionManager]
    DBX[AppDbContext]

    OC --> OS
    OC --> CHS
    PC --> RS
    PC --> CHS
    ME --> MS
    ME --> CHS
    HC --> CHS

    OS --> RS
    OS --> MS
    OS --> CHS
    OS --> ASM
    RS --> ASM
    MS --> ASM
    CHS --> DBX
```

## 6. Estimation Pipeline (Product Flow)

The frontend surfaces an eight-stage pipeline. Stages 1–2 are built; 3–8 are the target roadmap
backed by the target ER model.

```mermaid
flowchart LR
    A[1. Requirements] --> B[2. Modules]
    B --> C[3. Assumptions]
    C --> D[4. Risks]
    D --> E[5. User Stories]
    E --> F[6. Effort Estimation<br/>subtasks + complexity]
    F --> G[7. Total Project Estimation<br/>+ risk buffer + confidence]
    G --> H[8. Proposal Generation]

    style A fill:#d4edda,stroke:#28a745
    style B fill:#d4edda,stroke:#28a745
    style C fill:#fff3cd,stroke:#ffc107
    style D fill:#fff3cd,stroke:#ffc107
    style E fill:#f8d7da,stroke:#dc3545
    style F fill:#f8d7da,stroke:#dc3545
    style G fill:#f8d7da,stroke:#dc3545
    style H fill:#fff3cd,stroke:#ffc107
```

Legend: green = built · amber = partial (UI only) · red = planned.

## 7. Orchestration Flow (Runtime)

```mermaid
sequenceDiagram
    participant U as User (SPA)
    participant O as OrchestratorController
    participant H as ChatHistoryService
    participant S as OrchestratorService
    participant L as LLM (IChatClient)
    participant DB as Database

    U->>O: POST /project/orchestrate {conversation_id, project_id, message}
    O->>O: validate inputs (guard clauses)
    O->>H: EnsureConversationAsync + persist user turn
    H->>DB: insert conversation/message
    O->>S: RunAsync(conversationId, projectId, message)
    S->>L: route to analyze_requirements or estimate_modules
    L-->>S: structured JSON (requirements | modules)
    S-->>O: OrchestratorResult (typed payload)
    alt requirements complete
        O->>H: SaveRequirementsAsync (upsert)
        H->>DB: upsert requirements
    else modules produced
        O->>H: SaveModulesAsync (replace set)
        H->>DB: replace modules
    end
    O->>H: persist assistant reply (with kind)
    O-->>U: OrchestratorResponse {tool_invoked, message, kind, data}
```

## 8. Data Architecture (Target, Conceptual)

The current persisted model covers Conversations, Messages, Requirements, and Modules.
The target model (from `docs/erDiagram.txt`) extends this to the full estimation domain.

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : owns
    PROJECTS ||--o{ CONVERSATIONS : has
    CONVERSATIONS ||--o{ MESSAGES : contains
    PROJECTS ||--o| REQUIREMENTS : has
    PROJECTS ||--o{ MODULES : contains
    PROJECTS ||--o{ USER_STORIES : contains
    MODULES ||--o{ USER_STORIES : contains
    USER_STORIES ||--o{ SUBTASKS : contains
    PROJECTS ||--o{ ASSUMPTIONS : contains
    PROJECTS ||--o{ RISKS : contains
    MODULES ||--o{ ACCEPTANCE_CRITERIA : defines
    MODULES ||--o{ COMPLEXITY_ASSESSMENTS : assessed
    MODULES ||--o{ MODULE_ESTIMATIONS : estimated
    PROJECTS ||--o{ PROJECT_ESTIMATIONS : contains
    PROJECTS ||--o{ PROPOSAL_DOCUMENTS : generates
```

Full attribute-level ER and the gap between current and target are in `LLD_document.md`.

## 9. Cross-Cutting: Security (OWASP Top 10 2021)

```mermaid
flowchart TB
    subgraph Edge[Edge / Transport]
        TLS[HTTPS + HSTS]
        CORS[Origin-restricted CORS]
        RL[Rate limiting]
    end
    subgraph AppSec[Application]
        AUTHN[AuthN — session/JWT]
        AUTHZ[AuthZ — ownership checks / anti-IDOR]
        VAL[Input validation + output sanitization]
        ERR[Safe error handling]
    end
    subgraph DataSec[Data & Platform]
        HASH[Password + token hashing]
        SEC[Secrets from vault/env]
        LOG[Audit logging]
        SCA[Dependency scanning]
    end
    Request --> Edge --> AppSec --> DataSec
```

| OWASP category | Control in this system |
|---|---|
| A01 Broken Access Control | Every project/conversation/module endpoint verifies the resource belongs to the authenticated user (anti-IDOR); no wildcard reads. |
| A02 Cryptographic Failures | Passwords hashed with bcrypt/Argon2 + salt; reset tokens hashed; TLS in transit; secrets never in code. |
| A03 Injection | Parameterized EF queries; DTO validation; model output rendered as data (no HTML/script execution, no `javascript:` links). |
| A04 Insecure Design | Server-authoritative routing/totals; rate-limited LLM endpoints to bound cost and DoS. |
| A05 Security Misconfiguration | Environment-scoped CORS (no wildcard-with-credentials); HSTS; no debug details in responses. |
| A06 Vulnerable Components | Pinned dependencies; `dotnet list package --vulnerable` / `npm audit` in CI. |
| A07 Identification & Auth Failures | Strong password policy; brute-force throttling; single-use expiring reset tokens; server-side logout. |
| A08 Software & Data Integrity | Upserts keyed by conversation; server recomputes estimates; proposals generated from stored data. |
| A09 Logging & Monitoring | Structured audit logs for auth, access denials, and generation events; no secrets/PII in logs. |
| A10 SSRF | Outbound calls restricted to the configured LLM endpoint; uploaded document content cannot trigger arbitrary fetches. |

**Known gaps to remediate (see US-039..US-046):** hardcoded LLM key fallback in `Program.cs`, unauthenticated endpoints, and `ex.Message` returned to clients.

## 10. Deployment View

```mermaid
graph TB
    subgraph CDN[Static Hosting / CDN]
        SPA[React SPA build]
    end
    subgraph AppTier[App Tier]
        API[ASP.NET Core API<br/>containerized]
    end
    subgraph DataTier[Data Tier]
        RDBMS[(RDBMS<br/>SQLite dev, server prod)]
        VAULT[Secret Store]
    end
    LLM[OpenRouter API]

    SPA -->|HTTPS /api| API
    API --> RDBMS
    API --> VAULT
    API -->|HTTPS| LLM
```

## 11. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, TipTap editor, lucide-react |
| Backend | ASP.NET Core (.NET 10), controller-based Web API |
| AI | Microsoft.Extensions.AI (`IChatClient`), Microsoft.Agents.AI (`AIAgent`, sessions), OpenRouter provider |
| Data | EF Core, SQLite (dev), JSON value converters for list columns |
| Testing | xUnit, `WebApplicationFactory` integration tests, `FakeChatClient` |

## 12. Quality Attributes

- **Performance:** conversational turns should return within an interactive latency budget; long pipelines run asynchronously with progress feedback.
- **Scalability:** stateless API tier scales horizontally; the in-memory `AgentSessionManager` must move to a distributed store (e.g., Redis) for multi-instance deployments.
- **Reliability:** agent JSON parsing failures degrade gracefully to an error envelope rather than crashing the turn.
- **Security:** as per Section 9.
- **Accessibility:** WCAG 2.1 AA targeted; full validation requires manual assistive-technology testing and expert review.
