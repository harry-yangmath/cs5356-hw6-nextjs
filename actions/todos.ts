"use server"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { todos } from "@/database/schema"
import { z } from "zod"

// Validation schema
const TodoSchema = z.object({
  title: z.string().min(1, { message: "Todo title cannot be empty" })
})

export async function createTodo(prevState: any, formData: FormData) {
  // Check authentication using cookies
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('auth_session')
  
  if (!sessionCookie) {
    return { 
      success: false, 
      error: "You must be logged in to create a todo" 
    }
  }

  // Artificial delay for development
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Extract and validate title
  const title = formData.get('title')
  const validationResult = TodoSchema.safeParse({ title })

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.errors[0].message
    }
  }

  try {
    // Here you might need to add logic to get the current user ID
    // This depends on how Better Auth stores user information in the session
    const userId = ""; // TODO: Replace with actual user ID retrieval

    // Insert todo for the current user
    await db.insert(todos).values({
      title: title as string,
      userId: userId,
      completed: false
    })

    // Revalidate the todos page
    revalidatePath('/todos')

    return { 
      success: true, 
      error: null 
    }
  } catch (error) {
    return { 
      success: false, 
      error: "Failed to create todo" 
    }
  }
}

export async function toggleTodo(formData: FormData) {
  // Check authentication using cookies
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('auth_session')
  
  if (!sessionCookie) {
    return { 
      success: false, 
      error: "You must be logged in to toggle a todo" 
    }
  }

  const id = formData.get("id") as string
  const completed = formData.get("completed") === "true"

  try {
    // Update todo
    await db.update(todos)
      .set({ completed: !completed })
      .where(eq(todos.id, id))

    // Revalidate the todos page
    revalidatePath('/todos')

    return { 
      success: true, 
      error: null 
    }
  } catch (error) {
    return { 
      success: false, 
      error: "Failed to toggle todo" 
    }
  }
}

export async function deleteTodo(formData: FormData) {
  // Check authentication using cookies
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('auth_session')
  
  if (!sessionCookie) {
    return { 
      success: false, 
      error: "You must be logged in to delete a todo" 
    }
  }

  const id = formData.get("id") as string

  try {
    // Delete todo
    await db.delete(todos)
      .where(eq(todos.id, id))

    // Revalidate the todos page
    revalidatePath('/todos')

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