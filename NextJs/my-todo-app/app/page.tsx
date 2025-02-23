import { useEffect, useState } from 'react';
import axios from 'axios';
import { Todo } from '../app/types/todo';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get<Todo[]>('/api/todos');
      setTodos(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  const addTodo = async () => {
    try {
      const response = await axios.post<Todo>('/api/todos', { title: newTodo });
      setTodos([...todos, response.data]);
      setNewTodo('');
    } catch (error) {
      console.error(error);
    }
  }

  const updateTodo = async (id: number, completed: boolean) => {
    try {
      await axios.put(`/api/todos/${id}`, { completed });
      setTodos(todos.map(todo => todo.id === id ? { ...todo, completed } : todo));
    } catch (error) {
      console.error(error);
    }

    const deleteTodo = async (id: number) => {
      try {
        await axios.delete(`/api/todos/${id}`);
        setTodos(todos.filter(todo => todo.id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  }
  
  return (
    <>
      <div>
        <h1>Todo List</h1>
        <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} />
        <button onClick={addTodo}>Add Todo</button>
        <ul>
          {todos.map(todo => (
            <li key={todo.id}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => updateTodo(todo.id, !todo.completed)}
              />
              {todo.title}
              <button onClick={() => deleteTodo(todo.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
