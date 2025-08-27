import { Link, Outlet } from "react-router-dom"
export default function Nav() {
  return (
    <>
      <h1>Hello World</h1>
      <nav>
        <ul style={{ display: "flex", justifyContent: "space-between" }}>
          <li>
            <Link to="/home">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/setting">Setting</Link>
          </li>
          <li>
            <Link to="/form">Form</Link>
          </li>
          <li>
            <Link to="/form2">Form2</Link>
          </li>
        </ul>
      </nav>
      <Outlet />
    </>
  )
}
