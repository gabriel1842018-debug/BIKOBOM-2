import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Login from './pages/Login'
import Home from './pages/Home'
import Search from './pages/Search'
import Profile from './pages/Profile'

function RequireAuth({ children }) {
  const [status, setStatus] = useState('loading') // loading | authed | anon

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? 'authed' : 'anon')
    })
  }, [])

  if (status === 'loading') return null
  if (status === 'anon') return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/buscar" element={<RequireAuth><Search /></RequireAuth>} />
        <Route path="/perfil" element={<RequireAuth><Profile /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}
