// src/app/components/TodoList.tsx
"use client";

import { Todo } from '../models/Todo';
import { updateTodo, deleteTodo } from '../utils/api';

interface TodoListProps {
  todos: Todo[];
  onUpdate: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onUpdate, onDelete }) => {
  const handleToggle = async (todo: Todo) => {
    const updatedTodo = await updateTodo({ ...todo, completed: !todo.completed });
    onUpdate(updatedTodo);
  };

  const handleDelete = async (id: number) => {
    await deleteTodo(id);
    onDelete(id);
  };

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => handleToggle(todo)}
          />
          <span>{todo.text}</span>
          <button onClick={() => handleDelete(todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
};

export default TodoList;
