using System.ClientModel;
using Agents.Data;
using Agents.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;
using OpenAI;
using SessionManager;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// --- SQLite persistence (EF Core) ---
var connectionString = builder.Configuration.GetConnectionString("AppDb")
    ?? "Data Source=app.db";
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));

// --- Chat client (OpenRouter, OpenAI-compatible) ---
// NOTE: the API key here is read from config when present; the hardcoded value is
// kept as a fallback to preserve existing behavior. Rotate it and move it to
// user-secrets / environment variables for anything beyond local dev.
var apiKey = builder.Configuration["OpenRouter:ApiKey"];
var model = builder.Configuration["OpenRouter:Model"] ?? "google/gemma-4-26b-a4b-it:free";

var openAiClient = new OpenAIClient(
    credential: new ApiKeyCredential(apiKey),
    options: new OpenAIClientOptions
    {
        Endpoint = new Uri("https://openrouter.ai/api/v1/")
    });

IChatClient chatClient = openAiClient
    .GetChatClient(model)
    .AsIChatClient();

builder.Services.AddSingleton<IChatClient>(chatClient);
builder.Services.AddSingleton<AgentSessionManager>();

// --- Application services ---
builder.Services.AddScoped<IChatHistoryService, ChatHistoryService>();
builder.Services.AddScoped<IRequirementsService, RequirementsService>();
builder.Services.AddScoped<IModulesService, ModulesService>();
builder.Services.AddScoped<IOrchestratorService, OrchestratorService>();
builder.Services.AddScoped<IRiskService, RiskService>();


var app = builder.Build();

// Create the SQLite schema on startup (no migrations needed for this simple schema).
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.UseCors("AllowFrontend");
app.MapControllers();

app.Run();

// Exposed for WebApplicationFactory in integration tests.
public partial class Program { }
