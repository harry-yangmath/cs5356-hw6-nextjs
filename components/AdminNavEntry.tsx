"use client"

import { auth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "./ui/button"
import { useEffect, useState } from "react"

export function AdminNavEntry() {
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
    <Link href="/admin">
      <Button variant="ghost">Admin</Button>
    </Link>
  )
}