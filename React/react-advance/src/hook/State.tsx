import { useState } from "react";

export default function State() {
  const [Count, setCount] = useState(0);
  const Increment = () => setCount(Count + 1);
  const Decrement = () => setCount(Count - 1);
  return (
    <div>
      <button onClick={Increment}>Increment</button>
      <p>{Count}</p>
      <button onClick={Decrement}>Decrement</button>
    </div>
  );
}
