// src/app/components/TodoForm.tsx

"use client";

import { useState, FormEvent } from 'react';
import { createTodo } from '../utils/api';
import { Todo } from '../models/Todo';
import styles from '../styles/Home.module.css';

interface TodoFormProps {
  onAdd: (todo: Todo) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onAdd }) => {
  const [text, setText] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newTodo = await createTodo({ text, completed: false });
    onAdd(newTodo);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new todo"
        className={styles.input}
      />
      <button type="submit" className={styles.button}>Add</button>
    </form>
  );
};

export default TodoForm;
 