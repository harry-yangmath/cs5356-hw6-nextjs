"use server"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { db } from "@/database/db"
import { todos, sessions, users } from "@/database/schema"
import { z } from "zod"

// Validation schema
const TodoSchema = z.object({
  title: z.string().min(1, { message: "Todo title cannot be empty" })
})

export async function createTodo(prevState: any, formData: FormData) {
  // Check authentication using cookies
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('auth_session')
  
  if (!sessionCookie) {
    return { 
      success: false, 
      error: "You must be logged in to create a todo" 
    }
  }

  try {
    // Find the session and associated user
    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, sessionCookie.value),
      with: {
        user: true
      }
    })

    if (!session) {
      return { 
        success: false, 
        error: "Invalid session" 
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

    // Insert todo for the current user
    await db.insert(todos).values({
      title: title as string,
      userId: session.userId,
      completed: false
    })

    // Revalidate the todos page
    revalidatePath('/todos')

    return { 
      success: true, 
      error: null 
    }
  } catch (error) {
    console.error(error)
    return { 
      success: false, 
      error: "Failed to create todo" 
    }
  }
}

export async function toggleTodo(formData: FormData) {
  // Check authentication using cookies
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('auth_session')
  
  if (!sessionCookie) {
    return { 
      success: false, 
      error: "You must be logged in to toggle a todo" 
    }
  }

  try {
    // Find the session and associated user
    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, sessionCookie.value),
      with: {
        user: true
      }
    })

    if (!session) {
      return { 
        success: false, 
        error: "Invalid session" 
      }
    }

    const id = formData.get("id") as string
    const completed = formData.get("completed") === "true"

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
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('auth_session')
  
  if (!sessionCookie) {
    return { 
      success: false, 
      error: "You must be logged in to delete a todo" 
    }
  }

  try {
    // Find the session and associated user
    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, sessionCookie.value),
      with: {
        user: true
      }
    })

    if (!session) {
      return { 
        success: false, 
        error: "Invalid session" 
      }
    }

    const id = formData.get("id") as string

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