import { Todo } from "../types";

interface TodoItemProps {
    todo: Todo
    onToggle: (id: number) => void
    onDelete: (id: number) => void
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {

    return (
        <li>
            <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggle(todo.id)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>{todo.text}</span>
            <button onClick={() => onDelete(todo.id)}>Delete</button>
        </li>
    )
}

export default TodoItem 