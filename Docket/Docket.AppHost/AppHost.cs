var builder = DistributedApplication.CreateBuilder(args);
var postgres = builder.AddPostgres("postgres", port: 5433) .AddDatabase("docketdb");
var api = builder.AddProject<Projects.Docket_Api>("api") .WithReference(postgres) .WaitFor(postgres); // Also start my Docket.Api project and hand connection details(postgres var) to it. .WaitFor is to win the race condition otherwise API stops
builder.AddNpmApp("client", "../Docket.Client", "dev") .WithReference(api) .WaitFor(api) .WithHttpEndpoint(port: 9000, env: "PORT") .WithExternalHttpEndpoints();
builder.Build().Run();
