<div align="center">
  <h1>🗂️ Docket</h1>
  <p>A modern, multi-tenant Document Management System designed for organization and simplicity.</p>
</div>

<br/>

## ✨ Features

- **Multi-tenant Architecture:** Securely isolate data across different organizations or users.
- **Document Organization:** Organize your files efficiently using **Trays** and **Folders**.
- **Archive Management:** Upload, view, and manage document archives effortlessly.
- **Secure Authentication:** Built-in JWT-based authentication to keep your documents safe.
- **Developer Experience:** Zero-friction local setup powered by **.NET Aspire**. Automatic database migrations and unified logs.

## 🛠️ Tech Stack

### Backend
- **Framework:** .NET (ASP.NET Core Minimal APIs)
- **Data Access:** Entity Framework Core (EF Core)
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)

### Frontend
- **Library:** React 19 
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Language:** TypeScript

### Orchestration
- **Local Dev:** .NET Aspire (Manages API, Frontend, PostgreSQL, and PgWeb)

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download) (or later)
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Podman (Required by .NET Aspire to provision PostgreSQL and PgWeb containers automatically)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Docket
   ```

2. **Install frontend dependencies (Optional but recommended):**
   ```bash
   cd Docket/Docket.Client
   npm install
   cd ../..
   ```

### Running the Project

The easiest way to run the entire stack (Database, API, and Frontend) is by using the **.NET Aspire AppHost**.

#### Using the .NET CLI:

Navigate to the `AppHost` project and run it:
```bash
cd Docket/Docket.AppHost
dotnet run
```

#### Using Visual Studio / Rider:
1. Open the `Docket.sln` solution file.
2. Set **`Docket.AppHost`** as the Startup Project.
3. Press `F5` (or click Run).

### What happens when you run?

Once the AppHost starts, it will open the **.NET Aspire Dashboard** in your default browser. From the dashboard, you can:
- View the **React Client** (Frontend).
- View the **ASP.NET Core API** endpoints and Swagger UI.
- Access **PgWeb** to browse the PostgreSQL database tables.
- View real-time logs, metrics, and traces for all services.

*Note: Entity Framework migrations are configured to run automatically when the API starts, so your database will be ready to use immediately!*

## 📁 Project Structure

- `Docket.Api/` - The backend ASP.NET Core application, containing EF Core models, endpoints, and business logic.
- `Docket.Client/` - The React frontend application.
- `Docket.AppHost/` - The .NET Aspire orchestration project.
- `Docket.ServiceDefaults/` - Shared service defaults for telemetry, health checks, and resilience.

## 📝 License

This project is licensed under the MIT License.
