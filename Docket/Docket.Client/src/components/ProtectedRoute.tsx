import { Navigate } from 'react-router'
import type { ReactNode } from 'react'
type ProtectedRouteProps = { children: ReactNode }
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const token = localStorage.getItem('token')
    if (!token) { return <Navigate to="/login" replace /> }
    return children
}