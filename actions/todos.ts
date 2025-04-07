"use server"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { todos } from "@/database/schema"

export async function createTodo(formData: FormData) {
  // Authentication check
  const session = await auth();
  if (!session) {
    return { error: "Not authenticated" };
  }

  // Extract todo title from form data
  const title = formData.get("title") as string;
  
  // Validate title (can't be empty)
  if (!title || title.trim() === "") {
    return { error: "Title cannot be empty" };
  }

  try {
    // Optional: add delay to see optimistic updates
    // await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Insert the new todo into the database
    await db.insert(todos).values({
      title,
      completed: false,
      userId: session.user.id
    });
    
    // Revalidate the todos page to refresh data
    revalidatePath("/todos");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create todo" };
  }
}

export async function toggleTodo(formData: FormData) {
  // Authentication check
  const session = await auth();
  if (!session) {
    return { error: "Not authenticated" };
  }

  const id = formData.get("id") as string;
  
  try {
    // First, fetch the todo to check ownership
    const todoResult = await db.select().from(todos)
      .where(eq(todos.id, id))
      .limit(1);
    
    if (todoResult.length === 0) {
      return { error: "Todo not found" };
    }
    
    const todo = todoResult[0];
    
    // Ensure the user owns this todo (defensive programming)
    if (todo.userId !== session.user.id) {
      return { error: "Not authorized to modify this todo" };
    }
    
    // Toggle the todo's completed status
    await db.update(todos)
      .set({ completed: !todo.completed })
      .where(eq(todos.id, id));
    
    revalidatePath("/todos");
    return { success: true };
  } catch (error) {
    return { error: "Failed to toggle todo" };
  }
}

export async function deleteTodo(formData: FormData) {
  // Authentication check
  const session = await auth();
  if (!session) {
    return { error: "Not authenticated" };
  }
  
  const id = formData.get("id") as string;
  await db.delete(todos)
    .where(eq(todos.id, id));
  revalidatePath("/admin");
}
