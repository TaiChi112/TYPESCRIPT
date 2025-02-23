"use client"
import React, { useState } from 'react'

export default function button() {
    const [count, setCount] = useState(0)
    return (
        <>
            <button onClick={() => setCount(count + 1)}>Increament</button>
            <h1>Count : {count}</h1>
        </>
    )
}
