import { desc, eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { todos, users } from "@/database/schema"
import { Button } from "@/components/ui/button"
import { deleteTodo } from "@/actions/todos"

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  // Check authentication and admin role
  const session = await auth.session()
  
  // Redirect if not an admin
  if (!session || session.user.role !== 'admin') {
    redirect('/')
  }

  const allTodos = await db.select({
    id: todos.id,
    title: todos.title,
    user: {
      name: users.name
    }
  }).from(todos)
  .leftJoin(users, eq(todos.userId, users.id))
  .orderBy(desc(todos.createdAt))

  return (
    <main className="py-8 px-4">
      <section className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <div className="border rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="py-2 px-4 text-left">User</th>
                <th className="py-2 px-4 text-left">Todo</th>
                <th className="py-2 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allTodos.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-2 px-4 text-center">No todos found</td>
                </tr>
              )}
              {allTodos.map((todo) => (
                <tr key={todo.id} className="border-t">
                  <td className="py-2 px-4">{todo.user.name}</td>
                  <td className="py-2 px-4">{todo.title}</td>
                  <td className="py-2 px-4 text-center">
                    <form action={deleteTodo}>
                      <input type="hidden" name="id" value={todo.id} />
                      <Button
                        variant="destructive"
                        size="sm"
                        type="submit"
                      >
                        Delete
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}