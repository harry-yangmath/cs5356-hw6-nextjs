"use server"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { todos } from "@/database/schema"
import { z } from "zod"

export async function deleteTodo(formData: FormData) {
  // Check authentication and admin role
  const session = await auth.session()
  
  if (!session || session.user.role !== 'admin') {
    return { 
      success: false, 
      error: "Only admins can delete todos" 
    }
  }

  const id = formData.get("id") as string

  try {
    // Delete todo
    await db.delete(todos)
      .where(eq(todos.id, id))

    // Revalidate the todos page
    revalidatePath('/admin')

    return { 
      success: true, 
      error: null 
    }
  } catch (error) {
    return { 
      success: false, 
      error: "Failed to delete todo" 
    }
  }
}