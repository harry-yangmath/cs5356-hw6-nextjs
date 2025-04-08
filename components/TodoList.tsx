"use client"
import { useRef, useState, useOptimistic } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Todo } from "@/database/schema"
import { TodoItem } from "./TodoItem"
import { createTodo } from "@/actions/todos"

export function TodoList({ todos: initialTodos }: { todos: Todo[] }) {
  // Remove the unused setTodos or use it if needed
  const [todos, setTodos] = useState(initialTodos)
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Set up optimistic UI updates
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Partial<Todo>) => [...state, newTodo as Todo]
  )
  
  // Create a server action wrapper
  async function handleCreateTodo(formData: FormData) {
    setError(null)
    const title = formData.get("title") as string
    if (!title || title.trim() === '') {
      setError("Title cannot be empty")
      return
    }
    
    // Add optimistic todo
    addOptimisticTodo({
      id: `temp-${Date.now()}`,
      title,
      completed: false,
      optimistic: true
    } as Todo)
    
    // Call the server action
    const result = await createTodo(formData)
    
    // Reset form on success
    if (result?.success) {
      formRef.current?.reset()
    } else if (result?.error) {
      setError(result.error)
    }
  }
  
  return (
    <div className="space-y-4">
      <form
        ref={formRef}
        action={handleCreateTodo}
        className="flex gap-2 items-stretch"
      >
        <div className="flex-1">
          <Input
            name="title"
            placeholder="Add a new todo..."
            aria-invalid={error ? "true" : "false"}
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
        <Button type="submit">
          Add
        </Button>
      </form>
      <ul className="space-y-2">
        {optimisticTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            optimistic={todo.optimistic as boolean}
          />
        ))}
      </ul>
    </div>
  )
}