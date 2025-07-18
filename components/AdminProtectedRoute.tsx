'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

useEffect(() => {
  const checkSession = async () => {
    const { data } = await supabase.auth.getSession()
    const session = data?.session
    console.log("🔍 Current session:", session)

    if (!session || session.user?.email !== "codecrafted011@gmail.com") {
      console.log("❌ Invalid session or not admin. Redirecting to /admin/login")
      router.replace("/admin/login")
    } else {
      console.log("✅ Admin authenticated")
      setLoading(false)
    }
  }

  checkSession()
}, [router])


  if (loading) {
    return (
      <div className="text-center py-10">
        <p>🔒 Checking admin access...</p>
      </div>
    )
  }

  return <>{children}</>
}
