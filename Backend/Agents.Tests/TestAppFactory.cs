using Agents.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Agents.Tests
{
    /// <summary>
    /// Boots the real app but swaps in a unique in-memory EF database and the
    /// deterministic <see cref="FakeChatClient"/>, so tests exercise the full HTTP
    /// pipeline (routing, controllers, services, persistence) without OpenRouter.
    /// </summary>
    public class TestAppFactory : WebApplicationFactory<Program>
    {
        private readonly string _dbName = $"test-{Guid.NewGuid()}";

        /// <summary>Shared fake so a test can flip its behavior before making requests.</summary>
        public FakeChatClient Fake { get; } = new();

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
                // Remove the app's SQLite registration AND its internal EF provider
                // services — otherwise the InMemory provider added below collides with
                // Sqlite in EF's shared internal service provider.
                var toRemove = services.Where(d =>
                        d.ServiceType == typeof(DbContextOptions<AppDbContext>) ||
                        d.ServiceType == typeof(DbContextOptions) ||
                        d.ServiceType == typeof(AppDbContext) ||
                        (d.ServiceType.Namespace?.StartsWith("Microsoft.EntityFrameworkCore") ?? false))
                    .ToList();
                foreach (var d in toRemove)
                {
                    services.Remove(d);
                }

                services.AddDbContext<AppDbContext>(options =>
                    options.UseInMemoryDatabase(_dbName));

                // Replace the real chat client with the deterministic fake.
                services.RemoveAll<IChatClient>();
                services.AddSingleton<IChatClient>(Fake);
            });
        }
    }
}
