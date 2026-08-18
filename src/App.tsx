import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Profile from './pages/Profile'
import Checkout from './pages/Checkout'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-background text-dark font-hebrew">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
