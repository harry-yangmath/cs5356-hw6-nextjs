import { Todo } from "@/database/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleTodo } from "@/actions/todos";
import { useState } from "react";
import { useFormStatus } from "react-dom";  // Updated import

export function TodoItem({
  todo,
  optimistic = false
}: {
  todo: Todo,
  optimistic?: boolean
}) {
  const [error, setError] = useState<string | null>(null);
  
  async function handleToggle(formData: FormData) {
    if (optimistic) return; // Don't allow toggling optimistic todos
    const result = await toggleTodo(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  // Toggle form button with status
  function ToggleCheckbox() {
    const { pending } = useFormStatus();
    return (
      <Checkbox
        id={`todo-${todo.id}`}
        checked={todo.completed}
        disabled={pending || optimistic}
      />
    );
  }

  return (
    <li
      className={`flex items-center gap-2 rounded-lg border px-4 py-2 ${
        optimistic ? "opacity-70 bg-gray-100" : ""
      }`}
    >
      <form action={handleToggle}>
        <input type="hidden" name="id" value={todo.id} />
        <ToggleCheckbox />
      </form>
      <span className={`flex-1 ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
        {todo.title}
        {optimistic && <span className="ml-2 text-xs text-blue-500">(Adding...)</span>}
      </span>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </li>
  );
}