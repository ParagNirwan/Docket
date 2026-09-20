var builder = DistributedApplication.CreateBuilder(args);
var postgres = builder.AddPostgres("postgres", port: 5433) .WithDataVolume() .AddDatabase("docketdb");
var pgweb = builder.AddContainer("pgweb", "sosedoff/pgweb")
    .WithEndpoint(port: 8081, targetPort: 8081)
    .WithEnvironment("PGWEB_DATABASE_URL", postgres)
    .WaitFor(postgres);
var api = builder.AddProject<Projects.Docket_Api>("api")
    .WithReference(postgres)
    .WaitFor(postgres) // Wait for postgres to be healthy first - avoids the race condition where API tries to connect before Postgres is ready
    .WithHttpsEndpoint(port: 7100)
    .WithHttpEndpoint(port: 7101);builder.AddNpmApp("client", "../Docket.Client", "dev") .WithReference(api) .WaitFor(api) .WithHttpEndpoint(port: 9000, env: "PORT") .WithExternalHttpEndpoints();
builder.Build().Run();
