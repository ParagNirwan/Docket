var builder = DistributedApplication.CreateBuilder(args);

var postgresServer = builder.AddPostgres("postgres", port: 5433)
    .WithDataVolume();

var postgres = postgresServer.AddDatabase("docketdb");

var pgweb = builder.AddContainer("pgweb", "sosedoff/pgweb")
    .WithEndpoint(port: 8081, targetPort: 8081)
    .WithEnvironment(context =>
    {
        context.EnvironmentVariables["PGWEB_DATABASE_URL"] = ReferenceExpression.Create($"postgres://postgres:{postgresServer.Resource.PasswordParameter}@{postgresServer.Resource.PrimaryEndpoint.Property(EndpointProperty.Host)}:{postgresServer.Resource.PrimaryEndpoint.Property(EndpointProperty.Port)}/docketdb?sslmode=disable");
    })
    .WaitFor(postgres);

var api = builder.AddProject<Projects.Docket_Api>("api")
    .WithReference(postgres)
    .WaitFor(postgres)
    .WithHttpsEndpoint(port: 7100)
    .WithHttpEndpoint(port: 7101);

builder.AddNpmApp("client", "../Docket.Client", "dev")
    .WithReference(api)
    .WaitFor(api)
    .WithHttpEndpoint(port: 9000, env: "PORT")
    .WithExternalHttpEndpoints();

builder.Build().Run();