import { useState } from "react";

interface AddTodoProps {
    onAdd: (text: string) => void
}

const AddTodo: React.FC<AddTodoProps> = ({ onAdd }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return
        onAdd(text)
        setText('')
    }
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a new todo"
            />
            <button type="submit">Add</button>
        </form>
    )
}
export default AddTodo