import { useState } from 'react';

// interface ISquare {
//     value: string
// }
const StyleSquare1 = {
    width: 100,
    height: 100,
    padding: 10,
    border: `1px solid black`,
}
function Square() {
    const [value, setValue] = useState<string | null>(null);

    function handleClick(): void {
        setValue('X');
    }
    return (
        <>
            <button style={{
                ...StyleSquare1
            }} onClick={handleClick}>{value}</button>
        </>
    )
}
export default function Board() {
    return (
        <>
            <div className="board-row">
                <Square />
                <Square />
                <Square />
            </div>
            <div className="board-row">
                <Square />
                <Square />
                <Square />
            </div>
            <div className="board-row">
                <Square />
                <Square />
                <Square />
            </div>
        </>
    )
}