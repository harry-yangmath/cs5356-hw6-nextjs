"use client"
import { useActionState, useOptimistic } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Todo } from "@/database/schema"
import { TodoItem } from "./TodoItem"
import { createTodo } from "@/actions/todos"

export function TodoList({ todos: initialTodos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    initialTodos,
    (state, newTodo: Partial<Todo>) => [
      ...state, 
      { ...newTodo, id: `temp-${Date.now()}`, optimistic: true } as Todo
    ]
  )

  const [state, formAction] = useActionState(
    async (previousState: { error?: string }, formData: FormData) => {
      // Add optimistic todo immediately
      addOptimisticTodo({ 
        title: formData.get("title") as string,
        completed: false 
      })

      // Simulate slow network (optional)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Call server action
      const result = await createTodo(formData)

      // Handle result
      if (result.error) {
        return { error: result.error }
      }

      // Clear input on success
      return { error: undefined }
    },
    { error: undefined }
  )

  return (
    <div className="space-y-4">
      <form 
        action={formAction} 
        className="flex gap-2 items-stretch"
      >
        <div className="flex-1">
          <Input
            name="title"
            placeholder="Add a new todo..."
            aria-invalid={!!state.error}
          />
          {state.error && (
            <p className="text-sm text-red-500 mt-1">{state.error}</p>
          )}
        </div>
        <Button type="submit">Add</Button>
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