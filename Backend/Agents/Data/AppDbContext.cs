using System.Text.Json;
using Agents.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Agents.Data
{
    /// <summary>
    /// EF Core context for conversations, chat messages, requirements, and modules.
    /// List-valued columns are stored as JSON text in SQLite via value converters.
    /// </summary>
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Conversation> Conversations => Set<Conversation>();
        public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
        public DbSet<ProjectRequirement> ProjectRequirements => Set<ProjectRequirement>();
        public DbSet<ProjectModule> ProjectModules => Set<ProjectModule>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Serialize List<string> to a JSON string column, with a value comparer
            // so EF change-tracking treats the list by value, not by reference.
            var jsonOptions = new JsonSerializerOptions();

            var listConverter = new ValueConverter<List<string>, string>(
                v => JsonSerializer.Serialize(v, jsonOptions),
                v => string.IsNullOrEmpty(v)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new List<string>());

            var listComparer = new ValueComparer<List<string>>(
                (a, b) => (a ?? new List<string>()).SequenceEqual(b ?? new List<string>()),
                v => v == null ? 0 : v.Aggregate(0, (acc, s) => HashCode.Combine(acc, s.GetHashCode())),
                v => v == null ? new List<string>() : v.ToList());

            modelBuilder.Entity<Conversation>(e =>
            {
                e.HasKey(c => c.Id);
                e.Property(c => c.Id).ValueGeneratedNever();
                e.Property(c => c.ProjectId);

                e.HasMany(c => c.Messages)
                    .WithOne(m => m.Conversation!)
                    .HasForeignKey(m => m.ConversationId)
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(c => c.Requirement)
                    .WithOne(r => r.Conversation!)
                    .HasForeignKey<ProjectRequirement>(r => r.ConversationId)
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasMany(c => c.Modules)
                    .WithOne(m => m.Conversation!)
                    .HasForeignKey(m => m.ConversationId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ChatMessage>(e =>
            {
                e.HasKey(m => m.Id);
                e.HasIndex(m => m.ConversationId);
            });

            modelBuilder.Entity<ProjectRequirement>(e =>
            {
                e.HasKey(r => r.Id);
                e.HasIndex(r => r.ConversationId).IsUnique();

                e.Property(r => r.Scope).HasConversion(listConverter, listComparer);
                e.Property(r => r.TechnologyStack).HasConversion(listConverter, listComparer);
                e.Property(r => r.Integrations).HasConversion(listConverter, listComparer);
                e.Property(r => r.UserRoles).HasConversion(listConverter, listComparer);
                e.Property(r => r.SecurityRequirements).HasConversion(listConverter, listComparer);
            });

            modelBuilder.Entity<ProjectModule>(e =>
            {
                e.HasKey(m => m.Id);
                e.HasIndex(m => m.ConversationId);
                e.Property(m => m.Dependencies).HasConversion(listConverter, listComparer);
            });
        }
    }
}
