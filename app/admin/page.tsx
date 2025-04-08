import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/database/db"
import { todos } from "@/database/schema"
import { TodoList } from "@/components/TodoList"

export default async function TodosPage() {
  // Authentication check
  const session = await auth()
  
  // If not authenticated, return null or redirect
  if (!session) {
    return null // or redirect('/login')
  }

  // Fetch todos for the current user
  const userTodos = await db.query.todos.findMany({
    where: (todos, { eq }) => eq(todos.userId, session.user.id),
    orderBy: (todos, { desc }) => desc(todos.createdAt)
  })

  return <TodoList todos={userTodos} />
}