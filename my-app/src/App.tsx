import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from './Pages/HomePage'
import Dashboard from './Pages/Dashboard'
import OtherDashboard from './Pages/OtherDashboard'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/CrowdDashboard" element={<Dashboard />} />
          <Route path="/SalesDashboard" element={<OtherDashboard/>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
