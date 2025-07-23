import React from 'react'
import { navStyle, list } from '../style/main'

const Nav = () => {

    return (
        <>
            <nav style={navStyle}>
                <h1>Nav</h1>
                <ul style={list}>
                    <li><a href="/">home</a></li>
                    <li><a href="/test">test</a></li>
                </ul>
            </nav>
        </>
    )
}

export default Nav