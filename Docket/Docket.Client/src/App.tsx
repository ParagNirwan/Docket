import { Routes, Route } from 'react-router'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { CreateTenantPage } from './pages/CreateTenantPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/create-tenant" element={<CreateTenantPage/>}></Route>
    </Routes>
  )
}

export default App