import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { supabase } from './supabaseClient'

// ---------- Marca (nível de bolha) ----------
function LevelMark({ size = 22, color = '#F2A93B' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden="true">
      <rect x="1" y="9" width="20" height="4" rx="2" fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx="13" cy="11" r="2.6" fill={color} />
    </svg>
  )
}

// ---------- Navegação inferior ----------
const NAV_ITEMS = [
  { path: '/', icon: 'ti-home' },
  { path: '/buscar', icon: 'ti-search' },
  { path: '/chat', icon: 'ti-message-circle', disabled: true },
  { path: '/recompensas', icon: 'ti-award', disabled: true },
  { path: '/perfil', icon: 'ti-user' },
]

const navItemStyleDisabled = { opacity: 0.35, pointerEvents: 'none' }

function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path
        const linkClass = isActive ? 'active' : ''
        const linkStyle = item.disabled ? navItemStyleDisabled : undefined
        return (
          <a
            key={item.path}
            href={item.path}
            className={linkClass}
            style={linkStyle}
            onClick={(e) => { e.preventDefault(); navigate(item.path) }}
          >
            <i className={`ti ${item.icon}`} aria-hidden="true"></i>
          </a>
        )
      })}
    </nav>
  )
}

// ---------- Login / Cadastro ----------
function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id, email, name, city, state, is_freelancer: false,
          })
          if (profileError) throw profileError
        }
      }
      navigate('/')
    } catch (err) {
      setError(err.message || 'Não deu certo. Tenta de novo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <div className="topbar" style={{ paddingBottom: 32 }}>
        <div className="brand"><LevelMark /><span>bikobom</span></div>
        <p style={{ color: '#C9D2DE', fontSize: 13, margin: 0 }}>
          {mode === 'login' ? 'Entra na sua conta' : 'Cria sua conta'}
        </p>
      </div>
      <form className="page-pad" onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <>
            <input className="field" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required />
            <input className="field" placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} required />
            <input className="field" placeholder="Estado (ex: MG)" value={state} onChange={(e) => setState(e.target.value)} required />
          </>
        )}
        <input className="field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="field" type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="error-text">{error}</p>}
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Um instante...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>
        <button type="button" className="btn-secondary" style={{ marginTop: 8 }} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Ainda não tenho conta' : 'Já tenho conta'}
        </button>
      </form>
    </div>
  )
}

// ---------- Início ----------
const CATEGORIES = [
  { label: 'Pedreiro', icon: 'ti-brick' },
  { label: 'Eletricista', icon: 'ti-bolt' },
  { label: 'Encanador', icon: 'ti-droplet' },
  { label: 'Pintor', icon: 'ti-brush' },
]

function Home() {
  const [providers, setProviders] = useState([])
  const [userName, setUserName] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user) {
        const { data: profile } = await supabase.from('profiles').select('name').eq('id', userData.user.id).maybeSingle()
        if (profile?.name) setUserName(profile.name.split(' ')[0])
      }
      const { data } = await supabase.from('freelancers').select('user_id, roles, profiles(name, city, state)').limit(6)
      setProviders(data || [])
    }
    load()
  }, [])

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand"><LevelMark /><span>bikobom</span></div>
        <p style={{ color: '#C9D2DE', fontSize: 13, margin: '0 0 12px' }}>{userName ? `Bom dia, ${userName}` : 'Bom dia'}</p>
        <button className="search-box" onClick={() => navigate('/buscar')}>
          <i className="ti ti-search" aria-hidden="true"></i> O que você precisa hoje?
        </button>
      </div>
      <p className="section-title">Categorias</p>
      <div className="category-row">
        {CATEGORIES.map((c) => (
          <button key={c.label} className="category-chip" style={{ background: 'none', border: 'none', padding: 0 }} onClick={() => navigate(`/buscar?categoria=${c.label}`)}>
            <div className="icon-box"><i className={`ti ${c.icon}`} aria-hidden="true"></i></div>
            <p>{c.label}</p>
          </button>
        ))}
      </div>
      <p className="section-title">Profissionais no ponto</p>
      {providers.length === 0 && <p style={{ padding: '0 18px', fontSize: 12, color: 'var(--biko-sub)' }}>Nenhum profissional cadastrado ainda por aqui.</p>}
      {providers.map((p) => (
        <div className="provider-card" key={p.user_id}>
          <div className="avatar-placeholder" />
          <div style={{ flex: 1 }}>
            <p className="provider-name">{p.profiles?.name || 'Profissional'}</p>
            <p className="provider-meta">{(p.roles && p.roles[0]) || 'Prestador'} · {p.profiles?.city}, {p.profiles?.state}</p>
          </div>
          <LevelMark size={20} color="var(--biko-brick)" />
        </div>
      ))}
      <BottomNav />
    </div>
  )
}

// ---------- Busca ----------
function Search() {
  const [params] = useSearchParams()
  const [categoria, setCategoria] = useState(params.get('categoria') || '')
  const [cidade, setCidade] = useState('')
  const [results, setResults] = useState([])

  async function runSearch() {
    let query = supabase.from('freelancers').select('user_id, roles, description, profiles(name, city, state)')
    if (categoria) query = query.contains('roles', [categoria])
    const { data } = await query
    const filtered = cidade ? (data || []).filter((p) => p.profiles?.city?.toLowerCase().includes(cidade.toLowerCase())) : data || []
    setResults(filtered)
  }

  useEffect(() => { runSearch() }, []) // eslint-disable-line

  return (
    <div className="app-shell">
      <div className="topbar" style={{ paddingBottom: 18 }}><div className="brand"><span>Buscar profissional</span></div></div>
      <div className="page-pad" style={{ paddingBottom: 0 }}>
        <input className="field" placeholder="Categoria (ex: Pedreiro)" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
        <input className="field" placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
        <button className="btn-primary" onClick={runSearch}>Buscar</button>
      </div>
      <p className="section-title">{results.length} encontrados</p>
      {results.map((p) => (
        <div className="provider-card" key={p.user_id}>
          <div className="avatar-placeholder" />
          <div style={{ flex: 1 }}>
            <p className="provider-name">{p.profiles?.name || 'Profissional'}</p>
            <p className="provider-meta">{(p.roles && p.roles[0]) || 'Prestador'} · {p.profiles?.city}, {p.profiles?.state}</p>
          </div>
          <LevelMark size={20} color="var(--biko-brick)" />
        </div>
      ))}
      <BottomNav />
    </div>
  )
}

// ---------- Perfil ----------
function Profile() {
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) { navigate('/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', userData.user.id).maybeSingle()
      setProfile(data)
    }
    load()
  }, [navigate])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <div className="topbar" style={{ paddingBottom: 18 }}><div className="brand"><span>Meu perfil</span></div></div>
      <div className="page-pad">
        {profile ? (
          <>
            <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 4px' }}>{profile.name}</p>
            <p style={{ fontSize: 13, color: 'var(--biko-sub)', margin: '0 0 2px' }}>{profile.email}</p>
            <p style={{ fontSize: 13, color: 'var(--biko-sub)', margin: '0 0 20px' }}>{profile.city}, {profile.state}</p>
          </>
        ) : <p style={{ fontSize: 13, color: 'var(--biko-sub)' }}>Carregando...</p>}
        <button className="btn-secondary" onClick={handleLogout}>Sair da conta</button>
      </div>
      <BottomNav />
    </div>
  )
}

// ---------- Guarda de autenticação ----------
function RequireAuth({ children }) {
  const [status, setStatus] = useState('loading')
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setStatus(data.session ? 'authed' : 'anon'))
  }, [])
  if (status === 'loading') return null
  if (status === 'anon') return <Navigate to="/login" replace />
  return children
}

// ---------- App ----------
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
