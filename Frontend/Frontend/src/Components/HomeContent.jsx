import { useState, useRef, useEffect } from "react";
import {
  Paperclip,
  FileText,
  X,
  UploadCloud,
  ArrowUp,
  Sparkles,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  Plus,
} from "lucide-react";
import { sendChatMessage } from "../services/chatApi";
import { sendModuleApi } from "../services/ModuleApi";


const AGENTS = [
  { id: "requirements", label: "Requirement" },
  { id: "modules", label: "Modules" },
  { id: "assumptions", label: "Assumptions" },
  { id: "risks", label: "Risks" },
  { id: "userstories", label: "User Stories" },
  { id: "effort", label: "Effort Estimation" },
  { id: "totalestimation", label: "Total Project Estimation" },
  { id: "proposal", label: "Proposal Generation" }
];


function AgentStatusBar({ agentStatuses }) {
  return (
    <div
      className="px-6 py-2.5 flex items-center gap-3 overflow-x-auto border-b flex-shrink-0"
      style={{ backgroundColor: "var(--canvas)", borderColor: "var(--hairline)" }}
    >
      <span
        className="text-[11px] font-medium uppercase tracking-wider flex-shrink-0"
        style={{ color: "var(--ink-tertiary)" }}
      >
        Pipeline
      </span>
      <div className="flex items-center gap-1.5">
        {AGENTS.map((agent, index) => {
          const status = agentStatuses[agent.id] || "pending";
          const isActive = status === "active";
          const isDone = status === "completed";

          return (
            <div key={agent.id} className="flex items-center gap-1.5">
              {index > 0 && (
                <div
                  className="w-4 h-px flex-shrink-0"
                  style={{
                    backgroundColor: isDone
                      ? "var(--success)"
                      : isActive
                        ? "var(--primary)"
                        : "var(--hairline-strong)",
                  }}
                />
              )}
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium flex-shrink-0 whitespace-nowrap border"
                style={{
                  backgroundColor: isActive
                    ? "var(--primary-soft)"
                    : isDone
                      ? "transparent"
                      : "var(--surface-1)",
                  color: isActive
                    ? "var(--primary)"
                    : isDone
                      ? "var(--success)"
                      : "var(--ink-tertiary)",
                  borderColor: isActive
                    ? "var(--primary)"
                    : "var(--hairline)",
                }}
              >
                {isDone && <CheckCircle2 size={11} />}
                {isActive && <Loader2 size={11} className="animate-spin" />}
                {status === "pending" && <Circle size={11} />}
                {agent.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function AssistantAvatar() {
  return (
    <div
      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: "var(--primary)", color: "var(--on-primary)" }}
    >
      <Sparkles size={15} />
    </div>
  );
}


function AgentProgressCard({ agentStatuses }) {
  return (
    <div className="w-full px-6 md:px-10 py-5">
      <div className="max-w-3xl mx-auto flex gap-3">
        <AssistantAvatar />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium mb-2" style={{ color: "var(--ink-subtle)" }}>
            Estimation Agent
          </div>
          <div
            className="rounded-lg border p-4"
            style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--hairline)" }}
          >
            <div className="flex items-center gap-2 font-medium text-xs mb-3" style={{ color: "var(--primary)" }}>
              <Loader2 size={14} className="animate-spin" />
              Processing estimation pipeline...
            </div>

            <div className="space-y-2">
              {AGENTS.map((agent) => {
                const status = agentStatuses[agent.id] || "pending";
                return (
                  <div key={agent.id} className="flex items-center gap-2.5">
                    {status === "completed" && <CheckCircle2 size={14} style={{ color: "var(--success)" }} className="flex-shrink-0" />}
                    {status === "active" && <Loader2 size={14} style={{ color: "var(--primary)" }} className="animate-spin flex-shrink-0" />}
                    {status === "pending" && <Clock size={14} style={{ color: "var(--ink-tertiary)" }} className="flex-shrink-0" />}
                    <span
                      className="text-xs"
                      style={{
                        color: status === "active"
                          ? "var(--primary)"
                          : status === "completed"
                            ? "var(--ink-muted)"
                            : "var(--ink-tertiary)",
                        fontWeight: status === "active" ? 500 : 400,
                      }}
                    >
                      {agent.label}
                    </span>
                    {status === "active" && (
                      <span className="text-[10px] ml-auto" style={{ color: "var(--primary)" }}>Running...</span>
                    )}
                    {status === "completed" && (
                      <span className="text-[10px] ml-auto" style={{ color: "var(--success)" }}>Done</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function ChatMessage({ message, onContinue, isEstimating }) {
  const isUser = message.role === "user";

  // User messages: right-aligned bubble (ChatGPT style).
  if (isUser) {
    return (
      <div className="w-full px-6 md:px-10 py-4">
        <div className="max-w-3xl mx-auto flex justify-end gap-3">
          <div
            className="max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
            style={{ backgroundColor: "var(--primary)", color: "var(--on-primary)" }}
          >
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // Assistant messages: left-aligned with avatar.
  return (
    <div className="w-full px-6 md:px-10 py-5">
      <div className="max-w-3xl mx-auto flex gap-3">
        <AssistantAvatar />

        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium mb-1.5" style={{ color: "var(--ink-subtle)" }}>
            Estimation Agent
          </div>

          {message.isStreaming && !message.content ? (
            <div className="flex items-center gap-2" style={{ color: "var(--ink-subtle)" }}>
              <Loader2 size={14} className="animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          ) : (
            <>
              <div
                className="whitespace-pre-wrap text-sm leading-relaxed"
                style={{ color: "var(--ink)" }}
              >
                {message.content}
              </div>

              {/* Missing requirements list */}
              {message.missingRequirements && message.missingRequirements.length > 0 && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--hairline)" }}>
                  <div className="flex items-center gap-1.5 font-medium text-xs mb-2" style={{ color: "var(--warning)" }}>
                    <AlertCircle size={12} />
                    Missing Requirements
                  </div>
                  <ul className="space-y-1.5">
                    {message.missingRequirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--ink-muted)" }}>
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-semibold mt-px"
                          style={{ backgroundColor: "var(--primary-soft)", color: "var(--primary)" }}
                        >
                          {i + 1}
                        </span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Project details when matched */}
              {message.projectDetails && (
                <div
                  className="mt-3 rounded-lg border p-4 space-y-2"
                  style={{ backgroundColor: "var(--canvas)", borderColor: "var(--hairline)" }}
                >
                  <div className="flex items-center gap-1.5 font-medium text-xs mb-1" style={{ color: "var(--success)" }}>
                    <CheckCircle2 size={12} />
                    Project Requirements Complete
                  </div>

                  <ProjectDetailSection label="Objective" value={message.projectDetails.projectObjective} />
                  <ProjectDetailSection label="Platform" value={message.projectDetails.platform} />
                  <ProjectDetailSection label="Scope" value={message.projectDetails.scope} isList />
                  <ProjectDetailSection label="Technology Stack" value={message.projectDetails.technologyStack} isList />
                  <ProjectDetailSection label="Integrations" value={message.projectDetails.integrations} isList />
                  <ProjectDetailSection label="User Roles" value={message.projectDetails.userRoles} isList />
                  <ProjectDetailSection label="Expected Users" value={message.projectDetails.expectedUsers} />
                  <ProjectDetailSection label="Security" value={message.projectDetails.securityRequirements} isList />
                  <ProjectDetailSection label="Performance" value={message.projectDetails.performanceRequirements} />
                  <ProjectDetailSection label="Availability" value={message.projectDetails.availabilityRequirements} />
                </div>
              )}

              {/* Continue button when matched */}
              {message.isMatched && onContinue && (
                <div className="mt-4">
                  <button
                    onClick={onContinue}
                    disabled={isEstimating}
                    className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-md transition-colors"
                    style={{
                      backgroundColor: isEstimating ? "var(--surface-3)" : "var(--primary)",
                      color: isEstimating ? "var(--ink-tertiary)" : "var(--on-primary)",
                      cursor: isEstimating ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={(e) => { if (!isEstimating) e.currentTarget.style.backgroundColor = "var(--primary-hover)"; }}
                    onMouseLeave={(e) => { if (!isEstimating) e.currentTarget.style.backgroundColor = "var(--primary)"; }}
                  >
                    {isEstimating ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Estimating...
                      </>
                    ) : (
                      <>
                        Continue to Estimation
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


function ProjectDetailSection({ label, value, isList = false }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;

  return (
    <div className="text-xs leading-relaxed">
      <span className="font-medium" style={{ color: "var(--ink-subtle)" }}>{label}: </span>
      <span style={{ color: "var(--ink-muted)" }}>{isList ? value.join(", ") : value}</span>
    </div>
  );
}


function HomeContent({ selectedProject, onCreateProject, onModulesUpdate }) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [conversationId] = useState(() => crypto.randomUUID());
  const [projectId] = useState(() => crypto.randomUUID());
  const [agentStatuses, setAgentStatuses] = useState(
    () => Object.fromEntries(AGENTS.map(a => [a.id, "pending"]))
  );
  const [lastProjectDetails, setLastProjectDetails] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agentStatuses]);


  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      id: Date.now() + file.name,
      name: file.name,
      type: file.type
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };


  const simulateStreaming = (text, messageId) => {
    return new Promise((resolve) => {
      let currentIndex = 0;
      const chunkSize = Math.max(1, Math.floor(Math.random() * 3) + 1);
      const interval = setInterval(() => {
        currentIndex += chunkSize;
        if (currentIndex >= text.length) {
          currentIndex = text.length;
          clearInterval(interval);
          resolve();
        }
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId
              ? { ...msg, content: text.slice(0, currentIndex), isStreaming: currentIndex < text.length }
              : msg
          )
        );
      }, 20);
    });
  };


  const updateAgentStatus = (agentId, status) => {
    setAgentStatuses(prev => ({ ...prev, [agentId]: status }));
  };


  const simulateAgentProgress = (agentId, delayMs) => {
    return new Promise((resolve) => {
      updateAgentStatus(agentId, "active");
      setTimeout(() => {
        updateAgentStatus(agentId, "completed");
        resolve();
      }, delayMs);
    });
  };


  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || isLoading || isEstimating) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Add placeholder assistant message
    const assistantId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: assistantId,
      role: "assistant",
      content: "",
      isStreaming: true
    }]);

    try {
      const response = await sendChatMessage(conversationId, trimmed, projectId);

      if (response.error) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantId
              ? { ...msg, content: `Error: ${response.error}`, isStreaming: false }
              : msg
          )
        );
        return;
      }

      // Mark requirements agent as completed once chat succeeds
      if (response.isMatched) {
        updateAgentStatus("requirements", "completed");
        setLastProjectDetails(response.projectDetails);
      } else {
        updateAgentStatus("requirements", "active");
      }

      // Simulate streaming for the response text
      await simulateStreaming(response.response, assistantId);

      // Update final message with full data
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantId
            ? {
                ...msg,
                content: response.response,
                isStreaming: false,
                isMatched: response.isMatched,
                projectDetails: response.projectDetails,
                missingRequirements: response.missingRequirements
              }
            : msg
        )
      );
    } catch (error) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantId
            ? { ...msg, content: `Failed to get response: ${error.message}`, isStreaming: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  const handleContinue = async () => {
    if (isEstimating) return;

    setIsEstimating(true);
    setIsLoading(true);

    // Transition message
    const systemMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Starting the estimation pipeline. Analyzing your project requirements across all agents...",
      isStreaming: false
    };
    setMessages(prev => [...prev, systemMessage]);

    // Find the project details from the last matched message
    const matchedMessage = [...messages].reverse().find(m => m.isMatched && m.projectDetails);
    const projectDetails = matchedMessage?.projectDetails || lastProjectDetails;

    try {
      // Start the actual API call
      const moduleApiPromise = sendModuleApi(conversationId, projectId, projectDetails);

      // Simulate agent-by-agent progress
      // Requirements already done, now run through the rest
      await simulateAgentProgress("modules", 1500);
      await simulateAgentProgress("assumptions", 1200);
      await simulateAgentProgress("risks", 1000);
      await simulateAgentProgress("userstories", 1400);
      await simulateAgentProgress("effort", 1300);
      await simulateAgentProgress("totalestimation", 1100);

      // Wait for the actual API response before completing the last agent
      const moduleResponse = await moduleApiPromise;

      // Complete the final agent
      await simulateAgentProgress("proposal", 800);

      // Build module summary for the chat
      const modulesList = moduleResponse.modules || [];
      const moduleSummary = modulesList.length > 0
        ? `Estimation pipeline complete. Identified ${modulesList.length} module${modulesList.length !== 1 ? "s" : ""}:\n\n${
            modulesList.map((m, i) => `${i + 1}. ${m.module_name} — ${m.description}`).join("\n")
          }`
        : "Estimation pipeline complete. No modules were identified.";

      // Add completion message to chat
      const completionId = crypto.randomUUID();
      setMessages(prev => [...prev, {
        id: completionId,
        role: "assistant",
        content: "",
        isStreaming: true
      }]);

      await simulateStreaming(moduleSummary, completionId);

      setMessages(prev =>
        prev.map(msg =>
          msg.id === completionId
            ? { ...msg, content: moduleSummary, isStreaming: false }
            : msg
        )
      );

      // Sync modules data to the Modules section via parent callback
      if (onModulesUpdate && modulesList.length > 0) {
        const mappedModules = modulesList.map((m, index) => ({
          id: Date.now() + index,
          name: m.module_name,
          description: m.description,
          is_required: m.is_required,
          dependencies: m.dependencies || [],
          complexity: "Medium",
          userStories: 0
        }));
        onModulesUpdate(mappedModules);
      }

    } catch (error) {
      const errorMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Estimation failed: ${error.message}. Please try again.`,
        isStreaming: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsEstimating(false);
      setIsLoading(false);
    }
  };


  const handleTextareaInput = (e) => {
    setMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
  };


  if (!selectedProject) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: "var(--canvas)" }}>
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center mb-5"
            style={{ backgroundColor: "var(--primary-soft)", color: "var(--primary)" }}
          >
            <Sparkles size={26} />
          </div>
          <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
            No project selected
          </h2>
          <p className="mt-1.5 text-sm" style={{ color: "var(--ink-subtle)" }}>
            Create a project to start analyzing requirements and estimating effort.
          </p>
          <button
            onClick={onCreateProject}
            className="mt-6 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-colors"
            style={{ backgroundColor: "var(--primary)", color: "var(--on-primary)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--primary-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--primary)"; }}
          >
            <Plus size={18} />
            Create Project
          </button>
        </div>
      </div>
    );
  }


  const isSendDisabled = !message.trim() || isLoading || isEstimating;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ backgroundColor: "var(--canvas)" }}>

      {/* Agent Status Bar */}
      <AgentStatusBar agentStatuses={agentStatuses} />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: "var(--primary-soft)", color: "var(--primary)" }}
            >
              <Sparkles size={24} />
            </div>
            <h2 className="text-lg font-semibold mb-1.5" style={{ color: "var(--ink)" }}>
              {selectedProject.name}
            </h2>
            <p className="text-sm max-w-md" style={{ color: "var(--ink-subtle)" }}>
              Start by describing your project requirements. I'll analyze them and let you know when there's enough information to proceed with estimation.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onContinue={msg.isMatched ? handleContinue : null}
            isEstimating={isEstimating}
          />
        ))}

        {/* Agent Progress Card - shown during estimation */}
        {isEstimating && <AgentProgressCard agentStatuses={agentStatuses} />}

        <div ref={messagesEndRef} />
      </div>


      {/* Input Area */}
      <div className="px-6 py-4" style={{ backgroundColor: "var(--canvas)" }}>
        <div className="max-w-3xl mx-auto">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="rounded-2xl border p-3 transition-colors"
            style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--hairline-strong)" }}
          >
            {/* Attached Files */}
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {files.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs border"
                    style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--hairline)", color: "var(--ink-muted)" }}
                  >
                    <FileText size={14} style={{ color: "var(--primary)" }} />
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    <button
                      onClick={() => removeFile(file.id)}
                      style={{ color: "var(--ink-tertiary)" }}
                      className="hover:opacity-70"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Row */}
            <div className="flex items-end gap-2">
              <label
                className="cursor-pointer transition-colors p-1"
                style={{ color: "var(--ink-subtle)" }}
              >
                <Paperclip size={18} />
                <input
                  hidden
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>

              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                disabled={isEstimating}
                placeholder={isEstimating ? "Estimation in progress..." : "Describe your project requirements..."}
                rows={1}
                className="flex-1 resize-none outline-none text-sm bg-transparent max-h-[150px] leading-relaxed"
                style={{ color: "var(--ink)" }}
              />

              <button
                onClick={handleSend}
                disabled={isSendDisabled}
                className="p-2 rounded-xl transition-colors"
                style={{
                  backgroundColor: isSendDisabled ? "var(--surface-3)" : "var(--primary)",
                  color: isSendDisabled ? "var(--ink-tertiary)" : "var(--on-primary)",
                  cursor: isSendDisabled ? "not-allowed" : "pointer",
                }}
              >
                {isLoading || isEstimating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ArrowUp size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Hint row */}
          <div className="mt-2 flex justify-center items-center gap-1.5 text-[11px]" style={{ color: "var(--ink-tertiary)" }}>
            {isEstimating ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Estimation pipeline running — please wait
              </>
            ) : (
              <>
                <UploadCloud size={12} />
                Drag and drop documents or press Enter to send
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export default HomeContent;
