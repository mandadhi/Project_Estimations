namespace SessionManager
{
    using Microsoft.Agents.AI;
    using System.Collections.Concurrent;

    public class AgentSessionManager
    {
        private readonly ConcurrentDictionary<string, AgentSession> _sessions = new();

        public bool TryGetSession(string conversationId, out AgentSession? session)
        {
            return _sessions.TryGetValue(conversationId, out session);
        }

        public void AddSession(string conversationId, AgentSession session)
        {
            _sessions[conversationId] = session;
        }
    }
}