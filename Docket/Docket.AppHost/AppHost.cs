var builder = DistributedApplication.CreateBuilder(args);
var postgres = builder.AddPostgres("postgres", port: 5433) .AddDatabase("docketdb");
var api = builder.AddProject<Projects.Docket_Api>("api")
    .WithReference(postgres)
    .WaitFor(postgres) // Wait for postgres to be healthy first - avoids the race condition where API tries to connect before Postgres is ready
    .WithHttpsEndpoint(port: 7100)
    .WithHttpEndpoint(port: 7101);builder.AddNpmApp("client", "../Docket.Client", "dev") .WithReference(api) .WaitFor(api) .WithHttpEndpoint(port: 9000, env: "PORT") .WithExternalHttpEndpoints();
builder.Build().Run();
