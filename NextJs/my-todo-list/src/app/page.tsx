// src/app/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { Todo } from './models/Todo';
import { fetchTodos } from './utils/api';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import styles from './styles/Home.module.css';

const Home: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const loadTodos = async () => {
      const fetchedTodos = await fetchTodos();
      setTodos(fetchedTodos);
    };
    loadTodos();
  }, []);

  const handleAdd = (todo: Todo) => {
    setTodos((prev) => [...prev, todo]);
  };

  const handleUpdate = (updatedTodo: Todo) => {
    setTodos((prev) => prev.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo)));
  };

  const handleDelete = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  return (
    <div className={styles.container}>
      <h1>To-Do List</h1>
      <TodoForm onAdd={handleAdd} />
      <TodoList todos={todos} onUpdate={handleUpdate} onDelete={handleDelete} />
    </div>
  );
};

export default Home;
