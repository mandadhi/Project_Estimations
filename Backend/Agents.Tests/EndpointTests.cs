using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Agents.Data;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Agents.Tests
{
    /// <summary>
    /// Integration tests over the real HTTP pipeline using a fake IChatClient and an
    /// in-memory EF Core database. No network calls — fully deterministic.
    /// </summary>
    public class EndpointTests
    {
        private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

        // ---- /project/chat ---------------------------------------------------

        [Fact]
        public async Task Chat_MissingConversationId_Returns400()
        {
            using var factory = new TestAppFactory();
            var client = factory.CreateClient();

            var res = await client.PostAsJsonAsync("/project/chat", new
            {
                conversation_id = "",
                project_id = "p1",
                message = "hello"
            });

            Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        }

        [Fact]
        public async Task Chat_MissingMessage_Returns400()
        {
            using var factory = new TestAppFactory();
            var client = factory.CreateClient();

            var res = await client.PostAsJsonAsync("/project/chat", new
            {
                conversation_id = "c1",
                project_id = "p1",
                message = ""
            });

            Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        }

        [Fact]
        public async Task Chat_Unmatched_PersistsMessagesButNoRequirements()
        {
            using var factory = new TestAppFactory { Fake = { RequirementsMatched = false } };
            var client = factory.CreateClient();

            var res = await client.PostAsJsonAsync("/project/chat", new
            {
                conversation_id = "c-unmatched",
                project_id = "p1",
                message = "I want to build something"
            });

            res.EnsureSuccessStatusCode();
            var body = await res.Content.ReadFromJsonAsync<JsonElement>();
            Assert.False(body.GetProperty("isMatched").GetBoolean());

            using var scope = factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            Assert.Equal(2, db.ChatMessages.Count(m => m.ConversationId == "c-unmatched")); // user + assistant
            Assert.Empty(db.ProjectRequirements.Where(r => r.ConversationId == "c-unmatched"));
        }

        [Fact]
        public async Task Chat_Matched_PersistsRequirements()
        {
            using var factory = new TestAppFactory { Fake = { RequirementsMatched = true } };
            var client = factory.CreateClient();

            var res = await client.PostAsJsonAsync("/project/chat", new
            {
                conversation_id = "c-matched",
                project_id = "p1",
                message = "full requirements here"
            });

            res.EnsureSuccessStatusCode();
            var body = await res.Content.ReadFromJsonAsync<JsonElement>();
            Assert.True(body.GetProperty("isMatched").GetBoolean());

            using var scope = factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var req = db.ProjectRequirements.Single(r => r.ConversationId == "c-matched");
            Assert.True(req.IsMatched);
            Assert.Equal("Build an online store", req.ProjectObjective);
            Assert.Contains("catalog", req.Scope);
        }

        [Fact]
        public async Task Chat_InvalidJson_ReturnsErrorEnvelope()
        {
            using var factory = new TestAppFactory { Fake = { ReturnInvalidJson = true } };
            var client = factory.CreateClient();

            var res = await client.PostAsJsonAsync("/project/chat", new
            {
                conversation_id = "c-badjson",
                project_id = "p1",
                message = "hello"
            });

            res.EnsureSuccessStatusCode(); // contract: 200 with error envelope
            var body = await res.Content.ReadFromJsonAsync<JsonElement>();
            Assert.True(body.TryGetProperty("error", out _));
        }

        // ---- /project/orchestrate -------------------------------------------

        [Fact]
        public async Task Orchestrate_GatheringMessage_RoutesToRequirements()
        {
            using var factory = new TestAppFactory { Fake = { RequirementsMatched = false } };
            var client = factory.CreateClient();

            var res = await client.PostAsJsonAsync("/project/orchestrate", new
            {
                conversation_id = "o1",
                project_id = "p1",
                message = "Here is my project idea"
            });

            res.EnsureSuccessStatusCode();
            var body = await res.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal("analyze_requirements", body.GetProperty("tool_invoked").GetString());
        }

        [Fact]
        public async Task Orchestrate_AfterRequirements_RoutesToModules()
        {
            using var factory = new TestAppFactory { Fake = { RequirementsMatched = true } };
            var client = factory.CreateClient();

            // First establish complete requirements.
            await client.PostAsJsonAsync("/project/orchestrate", new
            {
                conversation_id = "o2",
                project_id = "p1",
                message = "full project description"
            });

            // Then ask to proceed — should route to modules estimation.
            var res = await client.PostAsJsonAsync("/project/orchestrate", new
            {
                conversation_id = "o2",
                project_id = "p1",
                message = "please estimate the modules now"
            });

            res.EnsureSuccessStatusCode();
            var body = await res.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal("estimate_modules", body.GetProperty("tool_invoked").GetString());

            using var scope = factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            Assert.True(db.ProjectModules.Count(m => m.ConversationId == "o2") >= 1);
        }

        // ---- /project/modules -----------------------------------------------

        [Fact]
        public async Task Modules_PersistsModuleSet()
        {
            using var factory = new TestAppFactory();
            var client = factory.CreateClient();

            var res = await client.PostAsJsonAsync("/project/modules", new
            {
                conversation_id = "m1",
                project_id = "p1",
                isMatched = true,
                response = "ok",
                projectDetails = new
                {
                    projectObjective = "store",
                    scope = new[] { "cart" },
                    platform = "Web",
                    technologyStack = new[] { "React" },
                    integrations = new string[] { },
                    userRoles = new[] { "customer" },
                    expectedUsers = "100",
                    securityRequirements = new string[] { },
                    performanceRequirements = "fast",
                    availabilityRequirements = "99%"
                },
                missingRequirements = new string[] { }
            });

            res.EnsureSuccessStatusCode();

            using var scope = factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            Assert.True(db.ProjectModules.Count(m => m.ConversationId == "m1") >= 1);
        }

        // ---- /project/{id}/history & snapshot -------------------------------

        [Fact]
        public async Task History_ReturnsOrderedMessages()
        {
            using var factory = new TestAppFactory { Fake = { RequirementsMatched = false } };
            var client = factory.CreateClient();

            await client.PostAsJsonAsync("/project/chat", new
            {
                conversation_id = "h1",
                project_id = "p1",
                message = "first message"
            });

            var res = await client.GetAsync("/project/h1/history");
            res.EnsureSuccessStatusCode();
            var body = await res.Content.ReadFromJsonAsync<JsonElement>();
            var messages = body.GetProperty("messages");
            Assert.True(messages.GetArrayLength() >= 2);
            Assert.Equal("user", messages[0].GetProperty("role").GetString());
        }

        [Fact]
        public async Task History_UnknownConversation_ReturnsEmpty()
        {
            using var factory = new TestAppFactory();
            var client = factory.CreateClient();

            var res = await client.GetAsync("/project/does-not-exist/history");
            res.EnsureSuccessStatusCode();
            var body = await res.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal(0, body.GetProperty("messages").GetArrayLength());
        }
    }
}
