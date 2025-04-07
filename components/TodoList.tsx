"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Todo } from "@/database/schema"
import { TodoItem } from "./TodoItem"
import { createTodo } from "@/actions/todos"
import { useOptimistic } from "react"
import { experimental_useFormStatus as useFormStatus } from "react-dom"

export function TodoList({ todos: initialTodos }: { todos: Todo[] }) {
  const [error, setError] = useState<string | null>(null)
  const [todos, setTodos] = useState(initialTodos)
  
  // Set up optimistic UI updates
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  )
  
  async function handleSubmit(formData: FormData) {
    // Clear previous errors
    setError(null)
    
    const title = formData.get("title") as string
    
    if (!title || title.trim() === "") {
      setError("Title cannot be empty")
      return
    }
    
    // Create optimistic todo
    const optimisticTodo = {
      id: `optimistic-${Date.now()}`,
      title,
      completed: false,
      userId: "current-user", // This will be replaced by the real user ID on the server
      createdAt: new Date(),
      updatedAt: new Date(),
      optimistic: true // Flag to identify optimistic todos
    } as Todo
    
    // Add optimistic todo to the UI
    addOptimisticTodo(optimisticTodo)
    
    // Submit the form data to the server action
    const result = await createTodo(formData)
    
    if (result?.error) {
      setError(result.error)
    } else {
      // Reset the form
      const form = document.querySelector("form") as HTMLFormElement
      form.reset()
    }
  }
  
  // Form status (pending state)
  function FormButton() {
    const { pending } = useFormStatus()
    
    return (
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add"}
      </Button>
    )
  }
  
  return (
    <div className="space-y-4">
      <form action={handleSubmit} className="flex gap-2 items-stretch">
        <div className="flex-1">
          <Input
            name="title"
            placeholder="Add a new todo..."
            aria-invalid={error ? "true" : "false"}
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
        <FormButton />
      </form>
      <ul className="space-y-2">
        {optimisticTodos.map((todo) => (
          <TodoItem 
            key={todo.id} 
            todo={todo} 
            optimistic={todo.optimistic}
          />
        ))}
      </ul>
    </div>
  )
}