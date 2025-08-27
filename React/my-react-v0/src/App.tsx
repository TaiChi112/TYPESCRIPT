import Home from './pages/home'
import About from './pages/about'
import Form from './pages/form'
import LayoutNav from './layout/nav'
import LayoutFooter from './layout/footer'
import Setting from './pages/setting'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Form2 from './pages/form2'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LayoutNav />}>
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/form" element={<Form />} />
          <Route path="/form2" element={<Form2 />} />
        </Route>

        <Route path="/" element={<LayoutFooter />}>
          <Route path="/setting" element={<Setting />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App


