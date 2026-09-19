import { Routes, Route } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { CreateTenantPage } from "./pages/CreateTenantPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UploadPage } from "./pages/UploadPage";
import { TenantDashboardPage } from "./pages/TenantDashboardPage";
import { ViewArchivePages } from "./pages/ViewArchivesPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/create-tenant"
        element={
          <ProtectedRoute>
            <CreateTenantPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenants"
        element={
          <ProtectedRoute>
            <TenantDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenant/:tenantId/upload"
        element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenant/:tenantId/view-archives"
        element={
          <ProtectedRoute>
            <ViewArchivePages />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
