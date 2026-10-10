import { Routes, Route, Navigate } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { CreateTenantPage } from "./pages/CreateTenantPage";
import { TenantDashboardPage } from "./pages/TenantDashboardPage";
import { UploadPage } from "./pages/UploadPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./layouts/Layout";
import { SettingsLayout } from "./layouts/SettingsLayout";
import { ViewArchivesPage } from "./pages/ViewArchivesPage";
import { ProfileSettingsPage } from "./pages/ProfileSettingsPage";
import { AppSettingsPage } from "./pages/AppSettingsPage";
import { TenantSettingsPage } from "./pages/TenantSettingsPage";

import { TenantWorkspaceLayout } from "./layouts/TenantWorkspaceLayout";
import { ReviewPage } from "./pages/ReviewPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={localStorage.getItem('token') ? <Navigate to="/tenants" replace /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/tenants" element={<TenantDashboardPage />} />
        <Route path="/create-tenant" element={<CreateTenantPage />} />

        <Route path="/tenant/:tenantId" element={<TenantWorkspaceLayout />}>
          <Route index element={<Navigate to="view-archives" replace />} />
          <Route path="view-archives" element={<ViewArchivesPage />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="upload" element={<UploadPage />} />
        </Route>
        
        <Route path="/settings" element={<SettingsLayout />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfileSettingsPage />} />
          <Route path="app" element={<AppSettingsPage />} />
          <Route path="tenant" element={<TenantSettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
export default App;
