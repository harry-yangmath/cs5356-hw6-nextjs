"use client"

import { auth } from "@/lib/auth"
import Link from "next/link"
import { useEffect, useState } from "react"

export function AdminLink() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function checkAdminStatus() {
      const session = await auth.session()
      setIsAdmin(session?.user.role === 'admin')
    }
    checkAdminStatus()
  }, [])

  if (!isAdmin) return null

  return (
    <Link 
      href="/admin" 
      className="text-sm font-medium text-gray-700 hover:text-gray-900"
    >
      Admin
    </Link>
  )
}