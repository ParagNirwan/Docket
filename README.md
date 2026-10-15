<div align="center">
  <h1>Docket</h1>
  <p>A multi-tenant document management application for organizing and managing documents across organizations.</p>
</div>

## Features

- Multi-tenant organization boundaries
- Document organization with trays and folders
- Archive/document upload and management
- JWT-based authentication
- Local orchestration and observability through .NET Aspire

## Tech stack

- **API:** .NET 10, ASP.NET Core Minimal APIs
- **Data:** Entity Framework Core and PostgreSQL
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Orchestration:** .NET Aspire

## Prerequisites

- .NET 10 SDK
- Node.js and npm
- Docker Desktop or another supported container runtime for the local database services

## Run locally

1. Clone the repository and open the solution.
2. Install client dependencies:

   ```bash
   cd Docket/Docket.Client
   npm install
   cd ../..
   ```

3. Start the Aspire AppHost:

   ```bash
   cd Docket/Docket.AppHost
   dotnet run
   ```

   Alternatively, open the solution in Visual Studio or Rider and set `Docket.AppHost` as the startup project.

4. Use the Aspire dashboard to access the API, frontend, and local service telemetry.

Database migrations are configured in the application startup path; review the migration and secret-management approach before deploying to a shared or production environment.

## Project structure

- `Docket.Api/` — API endpoints, domain logic, and EF Core integration
- `Docket.Client/` — React frontend
- `Docket.AppHost/` — Aspire orchestration
- `Docket.ServiceDefaults/` — shared service defaults

## Security and deployment

Supply secrets through environment-specific configuration and never commit credentials. Multi-tenant authorization should be tested explicitly to ensure users cannot access another tenant's documents. The local Aspire setup is for development, not a production deployment recipe.

## License

See the repository's license file.