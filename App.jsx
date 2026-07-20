import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom'
import { supabase } from './supabaseClient'

// ---------- Ícones (SVG próprio, não depende de fonte externa) ----------
function Icon({ children, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
}
const IconHome = (p) => <Icon {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></Icon>
const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Icon>
const IconChat = (p) => <Icon {...p}><path d="M4 4h16v12H8l-4 4V4z" /></Icon>
const IconAward = (p) => <Icon {...p}><circle cx="12" cy="8" r="5" /><path d="M8 13l-1.5 7L12 17l5.5 3L16 13" /></Icon>
const IconUser = (p) => <Icon {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" /></Icon>
const IconBrick = (p) => <Icon {...p}><rect x="3" y="9" width="18" height="6" rx="1" /><path d="M3 12h5M11 12h5M19 12h2" /></Icon>
const IconBolt = (p) => <Icon {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" /></Icon>
const IconDroplet = (p) => <Icon {...p}><path d="M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z" /></Icon>
const IconBrush = (p) => <Icon {...p}><path d="M9 15l-4 6" /><path d="M14 4c3 0 6 2 6 5 0 4-6 4-6 8-3 0-5-2-5-5 0-4 2-8 5-8z" /></Icon>
const IconBack = (p) => <Icon {...p}><path d="M15 18l-6-6 6-6" /></Icon>
const IconEdit = (p) => <Icon {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></Icon>
const IconTrash = (p) => <Icon {...p}><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13h10l1-13" /></Icon>
const IconPlus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>

// ---------- Marca (nível de bolha) ----------
function LevelMark({ size = 22, color = '#F2A93B' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden="true">
      <rect x="1" y="9" width="20" height="4" rx="2" fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx="13" cy="11" r="2.6" fill={color} />
    </svg>
  )
}

// ---------- Botão de voltar ----------
function BackButton() {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(-1)}
      aria-label="Voltar"
      style={{ background: 'none', border: 'none', color: '#FAF8F3', padding: 0, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
    >
      <IconBack size={18} />
      <span style={{ fontSize: 13 }}>Voltar</span>
    </button>
  )
}

// ---------- Navegação inferior ----------
const NAV_ITEMS = [
  { path: '/', Icon: IconHome },
  { path: '/buscar', Icon: IconSearch },
  { path: '/chat', Icon: IconChat, disabled: true },
  { path: '/recompensas', Icon: IconAward, disabled: true },
  { path: '/perfil', Icon: IconUser },
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
        const ItemIcon = item.Icon
        return (
          <a
            key={item.path}
            href={item.path}
            className={linkClass}
            style={linkStyle}
            onClick={(e) => { e.preventDefault(); navigate(item.path) }}
          >
            <ItemIcon size={22} />
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
  { label: 'Pedreiro', Icon: IconBrick },
  { label: 'Eletricista', Icon: IconBolt },
  { label: 'Encanador', Icon: IconDroplet },
  { label: 'Pintor', Icon: IconBrush },
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
          <IconSearch size={17} /> O que você precisa hoje?
        </button>
      </div>
      <p className="section-title">Categorias</p>
      <div className="category-row">
        {CATEGORIES.map((c) => {
          const CatIcon = c.Icon
          return (
            <button key={c.label} className="category-chip" style={{ background: 'none', border: 'none', padding: 0 }} onClick={() => navigate(`/buscar?categoria=${c.label}`)}>
              <div className="icon-box"><CatIcon size={20} /></div>
              <p>{c.label}</p>
            </button>
          )
        })}
      </div>
      <p className="section-title">Profissionais no ponto</p>
      {providers.length === 0 && <p style={{ padding: '0 18px', fontSize: 12, color: 'var(--biko-sub)' }}>Nenhum profissional cadastrado ainda por aqui.</p>}
      {providers.map((p) => (
        <button className="provider-card" key={p.user_id} style={{ width: 'calc(100% - 36px)', textAlign: 'left', border: '0.5px solid var(--biko-line)', cursor: 'pointer' }} onClick={() => navigate(`/prestador/${p.user_id}`)}>
          <div className="avatar-placeholder" />
          <div style={{ flex: 1 }}>
            <p className="provider-name">{p.profiles?.name || 'Profissional'}</p>
            <p className="provider-meta">{(p.roles && p.roles[0]) || 'Prestador'} · {p.profiles?.city}, {p.profiles?.state}</p>
          </div>
          <LevelMark size={20} color="var(--biko-brick)" />
        </button>
      ))}
      <BottomNav />
    </div>
  )
}

// ---------- Busca ----------
function Search() {
  const navigate = useNavigate()
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
      <div className="topbar" style={{ paddingBottom: 18 }}>
        <BackButton />
        <div className="brand"><span>Buscar profissional</span></div>
      </div>
      <div className="page-pad" style={{ paddingBottom: 0 }}>
        <input className="field" placeholder="Categoria (ex: Pedreiro)" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
        <input className="field" placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
        <button className="btn-primary" onClick={runSearch}>Buscar</button>
      </div>
      <p className="section-title">{results.length} encontrados</p>
      {results.map((p) => (
        <button className="provider-card" key={p.user_id} style={{ width: 'calc(100% - 36px)', textAlign: 'left', border: '0.5px solid var(--biko-line)', cursor: 'pointer' }} onClick={() => navigate(`/prestador/${p.user_id}`)}>
          <div className="avatar-placeholder" />
          <div style={{ flex: 1 }}>
            <p className="provider-name">{p.profiles?.name || 'Profissional'}</p>
            <p className="provider-meta">{(p.roles && p.roles[0]) || 'Prestador'} · {p.profiles?.city}, {p.profiles?.state}</p>
          </div>
          <LevelMark size={20} color="var(--biko-brick)" />
        </button>
      ))}
      <BottomNav />
    </div>
  )
}

// ---------- Perfil de prestador (visão pública) ----------
function ProviderDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [highlights, setHighlights] = useState([])

  useEffect(() => {
    async function load() {
      const { data: freelancerData } = await supabase.from('freelancers').select('*, profiles(name, city, state)').eq('user_id', id).maybeSingle()
      setData(freelancerData)
      const { data: highlightsData } = await supabase.from('highlights').select('*').eq('user_id', id)
      setHighlights(highlightsData || [])
    }
    load()
  }, [id])

  const allImages = highlights.flatMap((h) => h.images || [])

  return (
    <div className="app-shell">
      <div className="topbar" style={{ paddingBottom: 18 }}>
        <BackButton />
        <div className="brand"><span>{data?.profiles?.name || 'Profissional'}</span></div>
      </div>
      <div className="page-pad">
        {!data && <p style={{ fontSize: 13, color: 'var(--biko-sub)' }}>Carregando...</p>}
        {data && (
          <>
            <p className="provider-meta" style={{ marginBottom: 4 }}>{(data.roles && data.roles[0]) || 'Prestador'} · {data.profiles?.city}, {data.profiles?.state}</p>
            {data.phone_number && <p className="provider-meta" style={{ marginBottom: 12 }}>Telefone: {data.phone_number}</p>}
            {data.description && <p style={{ fontSize: 13, color: 'var(--biko-ink)', marginBottom: 16 }}>{data.description}</p>}

            <p className="section-title" style={{ margin: '0 0 10px', padding: 0 }}>Portfólio</p>
            {allImages.length === 0 && <p style={{ fontSize: 12, color: 'var(--biko-sub)' }}>Nenhuma foto adicionada ainda.</p>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {allImages.map((url, i) => (
                <img key={i} src={url} alt="Trabalho do profissional" style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 10, border: '0.5px solid var(--biko-line)' }} />
              ))}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  )
}

// ---------- Perfil ----------
function Profile() {
  const [profile, setProfile] = useState(null)
  const [freelancer, setFreelancer] = useState(null)
  const [userId, setUserId] = useState(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [becomingProvider, setBecomingProvider] = useState(false)
  const [editingProvider, setEditingProvider] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')

  const [role, setRole] = useState('Pedreiro')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')

  const [portfolio, setPortfolio] = useState([])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [portfolioError, setPortfolioError] = useState('')

  const navigate = useNavigate()

  async function loadAll() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) { navigate('/login'); return }
    setUserId(userData.user.id)

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userData.user.id).maybeSingle()
    setProfile(profileData)
    if (profileData) {
      setName(profileData.name || '')
      setCity(profileData.city || '')
      setState(profileData.state || '')
    }

    const { data: freelancerData } = await supabase.from('freelancers').select('*').eq('user_id', userData.user.id).maybeSingle()
    setFreelancer(freelancerData)
    if (freelancerData) {
      setRole((freelancerData.roles && freelancerData.roles[0]) || 'Pedreiro')
      setPhone(freelancerData.phone_number || '')
      setDescription(freelancerData.description || '')
      setPhotoUrl(freelancerData.profile_picture_url || '')

      const { data: highlightRow } = await supabase.from('highlights').select('*').eq('user_id', userData.user.id).maybeSingle()
      setPortfolio((highlightRow && highlightRow.images) || [])
    }
  }

  async function addPortfolioImage(e) {
    e.preventDefault()
    setPortfolioError('')
    const url = newImageUrl.trim()
    if (!url) return
    const updated = [...portfolio, url]
    const { data: existingRow } = await supabase.from('highlights').select('id').eq('user_id', userId).maybeSingle()
    const { error } = existingRow
      ? await supabase.from('highlights').update({ images: updated }).eq('id', existingRow.id)
      : await supabase.from('highlights').insert({ user_id: userId, role, images: updated })
    if (error) { setPortfolioError(error.message); return }
    setPortfolio(updated)
    setNewImageUrl('')
  }

  async function removePortfolioImage(url) {
    const updated = portfolio.filter((img) => img !== url)
    const { data: existingRow } = await supabase.from('highlights').select('id').eq('user_id', userId).maybeSingle()
    if (existingRow) await supabase.from('highlights').update({ images: updated }).eq('id', existingRow.id)
    setPortfolio(updated)
  }

  useEffect(() => { loadAll() }, []) // eslint-disable-line

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  async function saveProfile(e) {
    e.preventDefault()
    setSaveError('')
    const { error } = await supabase.from('profiles').update({ name, city, state }).eq('id', userId)
    if (error) { setSaveError(error.message); return }
    setEditingProfile(false)
    loadAll()
  }

  async function saveProvider(e) {
    e.preventDefault()
    setSaveError('')
    if (freelancer) {
      const { error } = await supabase.from('freelancers').update({
        roles: [role], phone_number: phone, description, profile_picture_url: photoUrl,
      }).eq('user_id', userId)
      if (error) { setSaveError(error.message); return }
    } else {
      const { error } = await supabase.from('freelancers').insert({
        user_id: userId, roles: [role], phone_number: phone, description, profile_picture_url: photoUrl,
        cpf: '', birthdate: '2000-01-01',
      })
      if (error) { setSaveError(error.message); return }
      await supabase.from('profiles').update({ is_freelancer: true }).eq('id', userId)
    }
    setBecomingProvider(false)
    setEditingProvider(false)
    loadAll()
  }

  return (
    <div className="app-shell">
      <div className="topbar" style={{ paddingBottom: 18 }}><div className="brand"><span>Meu perfil</span></div></div>

      <div className="page-pad">
        {!profile && <p style={{ fontSize: 13, color: 'var(--biko-sub)' }}>Carregando...</p>}

        {profile && !editingProfile && (
          <>
            <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 4px' }}>{profile.name}</p>
            <p style={{ fontSize: 13, color: 'var(--biko-sub)', margin: '0 0 2px' }}>{profile.email}</p>
            <p style={{ fontSize: 13, color: 'var(--biko-sub)', margin: '0 0 14px' }}>{profile.city}, {profile.state}</p>
            <button className="btn-secondary" style={{ marginBottom: 20 }} onClick={() => setEditingProfile(true)}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconEdit size={15} /> Editar dados</span>
            </button>
          </>
        )}

        {profile && editingProfile && (
          <form onSubmit={saveProfile} style={{ marginBottom: 20 }}>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" required />
            <input className="field" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" required />
            <input className="field" value={state} onChange={(e) => setState(e.target.value)} placeholder="Estado" required />
            {saveError && <p className="error-text">{saveError}</p>}
            <button className="btn-primary" type="submit">Salvar</button>
            <button className="btn-secondary" type="button" style={{ marginTop: 8 }} onClick={() => setEditingProfile(false)}>Cancelar</button>
          </form>
        )}

        <div style={{ borderTop: '0.5px solid var(--biko-line)', paddingTop: 18, marginBottom: 20 }}>
          {!freelancer && !becomingProvider && (
            <>
              <p style={{ fontSize: 13, color: 'var(--biko-sub)', margin: '0 0 10px' }}>
                Quer aparecer nas buscas e receber pedidos de clientes?
              </p>
              <button className="btn-primary" onClick={() => setBecomingProvider(true)}>Quero oferecer meus serviços</button>
            </>
          )}

          {freelancer && !editingProvider && (
            <>
              <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 6px' }}>Meu perfil de prestador</p>
              <p style={{ fontSize: 12, color: 'var(--biko-sub)', margin: '0 0 2px' }}>Categoria: {(freelancer.roles && freelancer.roles[0]) || '—'}</p>
              <p style={{ fontSize: 12, color: 'var(--biko-sub)', margin: '0 0 2px' }}>Telefone: {freelancer.phone_number || '—'}</p>
              <p style={{ fontSize: 12, color: 'var(--biko-sub)', margin: '0 0 10px' }}>{freelancer.description || 'Sem descrição ainda.'}</p>
              <button className="btn-secondary" onClick={() => setEditingProvider(true)}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconEdit size={15} /> Editar perfil de prestador</span>
              </button>
            </>
          )}

          {(becomingProvider || editingProvider) && (
            <form onSubmit={saveProvider}>
              <select className="field" value={role} onChange={(e) => setRole(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c.label} value={c.label}>{c.label}</option>)}
              </select>
              <input className="field" placeholder="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input className="field" placeholder="Link da foto (opcional)" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
              <textarea className="field" placeholder="Fale sobre seu trabalho" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              {saveError && <p className="error-text">{saveError}</p>}
              <button className="btn-primary" type="submit">Salvar</button>
              <button className="btn-secondary" type="button" style={{ marginTop: 8 }} onClick={() => { setBecomingProvider(false); setEditingProvider(false) }}>Cancelar</button>
            </form>
          )}
        </div>

        {freelancer && (
          <div style={{ borderTop: '0.5px solid var(--biko-line)', paddingTop: 18, marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 10px' }}>Fotos do meu trabalho (portfólio)</p>
            <p style={{ fontSize: 11, color: 'var(--biko-sub)', margin: '0 0 10px' }}>
              Por enquanto, adicione o link de uma foto já hospedada na internet (ex: um link do Google Fotos ou Imgur). Upload direto de arquivo vem numa próxima etapa.
            </p>
            {portfolio.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
                {portfolio.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} alt="Foto do portfólio" style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 8, border: '0.5px solid var(--biko-line)' }} />
                    <button
                      type="button"
                      onClick={() => removePortfolioImage(url)}
                      aria-label="Remover foto"
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(36,33,28,0.75)', border: 'none', borderRadius: 6, padding: 3, color: '#fff', cursor: 'pointer' }}
                    >
                      <IconTrash size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={addPortfolioImage} style={{ display: 'flex', gap: 6 }}>
              <input className="field" style={{ marginBottom: 0, flex: 1 }} placeholder="Link da foto" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} />
              <button className="btn-primary" type="submit" style={{ width: 44, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Adicionar foto">
                <IconPlus size={18} />
              </button>
            </form>
            {portfolioError && <p className="error-text">{portfolioError}</p>}
          </div>
        )}

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
        <Route path="/prestador/:id" element={<RequireAuth><ProviderDetail /></RequireAuth>} />
        <Route path="/perfil" element={<RequireAuth><Profile /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}
