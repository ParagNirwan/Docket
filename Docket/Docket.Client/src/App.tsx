import { Routes, Route, Navigate } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { CreateTenantPage } from "./pages/CreateTenantPage";
import { TenantDashboardPage } from "./pages/TenantDashboardPage";
import { UploadPage } from "./pages/UploadPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./layouts/Layout";
import { ViewArchivesPage } from "./pages/ViewArchivesPage";
import { AccountSettingsPage } from "./pages/AccountSettingsPage";
function App() {
  return (
    <Routes>
      <Route path="/" element={localStorage.getItem('token') ? <Navigate to="/tenants" replace /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            {" "}
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/tenants" element={<TenantDashboardPage />} />
        <Route path="/create-tenant" element={<CreateTenantPage />} />
        <Route path="/tenant/:tenantId/upload" element={<UploadPage />} />
        <Route path="/tenant/:tenantId/view-archives" element={<ViewArchivesPage />}/>
        <Route path="/account" element={<AccountSettingsPage />}/>

      </Route>{" "}
    </Routes>
  );
}
export default App;
