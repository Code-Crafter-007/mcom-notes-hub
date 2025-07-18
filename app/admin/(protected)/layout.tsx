import type { ReactNode } from "react"
import AdminProtectedRoute from "@/components/AdminProtectedRoute"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminProtectedRoute>{children}</AdminProtectedRoute>
}
