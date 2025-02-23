import { useState } from "react"
import AddTodo from "./components/AddTodo"
import TodoList from "./components/TodoList"
import { Todo } from "./types"
function App() {
  const [todos, setTodos] = useState<Todo[]>([])

  const handleAddTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false,
    }
    setTodos([...todos, newTodo])
  }

  const handleToggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo)
    )
  }

  const handleDeleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }
  return (
    <>
  <div>
    <h1>Todo List</h1>
    <AddTodo onAdd={handleAddTodo} />
    <TodoList todos={todos} onToggle={handleToggleTodo} onDelete={handleDeleteTodo} />
  </div>
    </>
  )
}

export default App
