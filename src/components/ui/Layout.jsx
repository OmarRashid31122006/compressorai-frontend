import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BarChart3, FileText, BookOpen, Settings,
  LogOut, Zap, ChevronRight, Shield,
  Wrench, FlaskConical, Clock, X, Sparkles, Search
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const roleColors = {
  admin:    { bg:'bg-cyan-400/15',  text:'text-cyan-400',  border:'border-cyan-400/30',  label:'Admin'    },
  engineer: { bg:'bg-blue-400/15', text:'text-blue-400', border:'border-blue-400/30', label:'Engineer' },
}

// ── Coming Soon data ──────────────────────────────────────────
const COMING_SOON_PAGES = {
  maintenance: {
    icon: Wrench, iconColor: '#f59e0b',
    badge: 'Coming Soon', badgeColor: 'rgba(245,158,11,0.15)', badgeBorder: 'rgba(245,158,11,0.3)', badgeText: '#f59e0b',
    title: 'Maintenance Module', subtitle: 'Predictive & Preventive Maintenance Management',
    message: `We appreciate your curiosity and enthusiasm. The Maintenance Module is currently under active development as part of CompressorAI's next major release.\n\nThis feature will empower engineers and facility managers with predictive maintenance scheduling, fault detection alerts, service history tracking, and AI-driven component lifecycle analysis — all seamlessly integrated within the CompressorAI ecosystem.\n\nWe kindly request your patience as our team works diligently to deliver this functionality with the precision and quality you deserve. Your continued trust and engagement inspire us to build better, faster, and smarter.\n\nThe wait, we assure you, will be well worth it.`,
    eta: 'Expected in a future release',
  },
}

function ComingSoonModal({ pageKey, onClose }) {
  const page = COMING_SOON_PAGES[pageKey]
  if (!page) return null
  const Icon = page.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg relative"
          style={{
            background: 'rgba(8,14,26,0.97)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
          }}>
          <div className="absolute top-0 left-8 right-8 h-0.5 rounded-full"
            style={{ background: `linear-gradient(90deg, transparent, ${page.iconColor}, transparent)` }}/>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)' }}>
            <X size={14} className="text-slate-400"/>
          </button>
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${page.iconColor}18`, border: `1px solid ${page.iconColor}40` }}>
                <Icon size={26} style={{ color: page.iconColor }}/>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-600 px-2.5 py-1 rounded-full"
                    style={{ background: page.badgeColor, border: `1px solid ${page.badgeBorder}`, color: page.badgeText }}>
                    {page.badge}
                  </span>
                  <Clock size={11} className="text-slate-600"/>
                  <span className="text-xs text-slate-600 font-mono">{page.eta}</span>
                </div>
                <h2 className="font-display font-800 text-white text-xl leading-tight">{page.title}</h2>
                <p className="text-slate-500 text-xs mt-0.5">{page.subtitle}</p>
              </div>
            </div>
            <div className="h-px mb-5" style={{ background:'rgba(255,255,255,0.06)' }}/>
            <div className="space-y-3">
              {page.message.trim().split('\n\n').map((para, i) => (
                <p key={i} className="text-sm text-slate-400 leading-relaxed"
                  style={{ fontFamily:'Georgia, serif', lineHeight:'1.75' }}>
                  {para.trim()}
                </p>
              ))}
            </div>
            <div className="mt-6 pt-4 flex items-center justify-between"
              style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <Sparkles size={13} style={{ color: page.iconColor }}/>
                <span className="text-xs text-slate-600 font-mono">CompressorAI v5.0</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="text-xs font-display font-600 px-4 py-2 rounded-xl transition-all"
                style={{
                  background: `${page.iconColor}18`,
                  border: `1px solid ${page.iconColor}40`,
                  color: page.iconColor,
                }}>
                Understood, Thank You
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function ComingSoonNavItem({ icon: Icon, label, badge, badgeColor, badgeText, collapsed, onClick }) {
  return (
    <motion.button whileHover={{ x: collapsed ? 0 : 3 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer mb-0.5 text-slate-500 hover:text-white hover:bg-white/5"
      style={{ border:'1px solid transparent' }}>
      <Icon size={18} className="flex-shrink-0" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="font-display font-600 text-sm whitespace-nowrap flex-1 text-left">
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {!collapsed && (
        <span className="text-[9px] font-mono font-600 px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={{ background: badgeColor, color: badgeText, border: `1px solid ${badgeText}40` }}>
          {badge}
        </span>
      )}
    </motion.button>
  )
}

// ── ✅ IMPROVED: Smart search with results dropdown ────────────
function SmartSearch() {
  const navigate    = useNavigate()
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await api.get(`/compressors/units/my`)
        const all = res.data || []
        const filtered = all.filter(u =>
          u.unit_id?.toLowerCase().includes(query.toLowerCase()) ||
          u.location?.toLowerCase().includes(query.toLowerCase()) ||
          u.type?.name?.toLowerCase().includes(query.toLowerCase())
        )
        setResults(filtered.slice(0, 5))
        setOpen(true)
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const go = (unit) => {
    navigate(`/analysis/${unit.id}`)
    setQuery(''); setOpen(false); setResults([])
  }

  return (
    <div ref={ref} className="relative hidden md:block">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
      <input
        placeholder="Search units..."
        className="border rounded-xl pl-9 pr-4 py-2 text-sm text-slate-400
          placeholder-slate-700 focus:outline-none focus:border-yellow-400/30 w-44 transition-all focus:w-52"
        style={{ background:'rgba(255,255,255,0.03)', borderColor:'rgba(255,255,255,0.08)' }}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
      />
      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:4 }}
            className="absolute top-full mt-1 right-0 w-64 rounded-xl overflow-hidden z-50"
            style={{ background:'rgba(8,14,26,0.98)', border:'1px solid rgba(0,212,255,0.15)', boxShadow:'0 12px 40px rgba(0,0,0,0.5)' }}>
            {loading ? (
              <div className="text-center py-4"><div className="spinner w-5 h-5 mx-auto" /></div>
            ) : results.length === 0 ? (
              <div className="text-center py-4 text-slate-500 text-xs font-mono">No units found</div>
            ) : results.map(u => (
              <button key={u.id} onClick={() => go(u)}
                className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b last:border-0"
                style={{borderColor:'rgba(255,255,255,0.05)'}}>
                <div className="text-white text-sm font-display font-600">{u.unit_id}</div>
                <div className="text-slate-500 text-xs font-mono">{u.type?.name} · {u.location || 'No location'}</div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Optimizer Nav Button ──────────────────────────────────────
function AnalysisNavButton({ collapsed }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const isActive  = location.pathname.startsWith('/analysis')
  const { hasRole } = useAuthStore()

  if (!hasRole(['admin', 'engineer'])) return null

  const handleClick = async () => {
    try {
      const res    = await api.get('/compressors/units/my')
      const list   = Array.isArray(res.data) ? res.data : (res.data?.results ?? [])
      const active = list.filter(u => u.is_active !== false)

      if (active.length === 0) {
        toast('No units linked yet. Add a compressor unit from the Dashboard.', {
          icon: '⚠️',
          style: { background:'#0d1a2e', color:'#e2e8f0', border:'1px solid rgba(250,204,21,0.2)' }
        })
        return
      }
      navigate(`/analysis/${active[0].id}`)
    } catch {
      toast.error('Could not load units. Please try again.')
    }
  }

  return (
    <motion.button
      whileHover={{ x: collapsed ? 0 : 3 }}
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
        isActive ? 'bg-yellow-400/12 text-yellow-400' : 'text-slate-500 hover:text-white hover:bg-white/5'
      }`}
      style={isActive
        ? { border:'1px solid rgba(250,204,21,0.2)', boxShadow:'0 0 12px rgba(250,204,21,0.1)' }
        : { border:'1px solid transparent' }}>
      <BarChart3 size={18} className="flex-shrink-0" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="font-display font-600 text-sm whitespace-nowrap">
            Optimizer
          </motion.span>
        )}
      </AnimatePresence>
      {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-400" />}
    </motion.button>
  )
}

function NavItem({ to, icon: Icon, label, collapsed, extraStyle }) {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <motion.div whileHover={{ x: collapsed ? 0 : 3 }}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer mb-0.5 ${
            isActive ? 'bg-yellow-400/12 text-yellow-400' : 'text-slate-500 hover:text-white hover:bg-white/5'
          }`}
          style={isActive
            ? { border:'1px solid rgba(250,204,21,0.2)', boxShadow:'0 0 12px rgba(250,204,21,0.1)', ...extraStyle }
            : { border:'1px solid transparent', ...extraStyle }}>
          <Icon size={18} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="font-display font-600 text-sm whitespace-nowrap">
                {label}
              </motion.span>
            )}
          </AnimatePresence>
          {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-400" />}
        </motion.div>
      )}
    </NavLink>
  )
}

// ── Layout ────────────────────────────────────────────────────
export default function Layout({ children }) {
  const [collapsed,       setCollapsed]      = useState(false)
  const [comingSoonModal, setComingSoonModal] = useState(null)
  const { user, logout, hasRole } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/') }

  const role = user?.role || 'engineer'
  const rc   = roleColors[role] || roleColors['engineer']
  const pageTitle = location.pathname.split('/')[1]?.replace('-', ' ') || 'dashboard'

  return (
    <div className="flex h-screen overflow-hidden bg-[#080e1a]">

      {/* ── SIDEBAR ── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}
        className="flex-shrink-0 flex flex-col relative z-20"
        style={{ background:'rgba(4,10,20,0.97)', borderRight:'1px solid rgba(255,255,255,0.06)' }}>

        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b flex-shrink-0"
          style={{ borderColor:'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-yellow-400/10 border border-yellow-400/30
              flex items-center justify-center flex-shrink-0 animate-glow-yellow">
              <Zap size={18} className="text-yellow-400" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                  exit={{ opacity:0, x:-10 }} className="min-w-0">
                  <div className="font-display font-800 text-white text-sm truncate">CompressorAI</div>
                  <div className="text-yellow-400/50 text-[9px] font-mono tracking-widest">OPTIMIZER v5.0</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
          <div className="mb-0.5">
            <AnalysisNavButton collapsed={collapsed} />
          </div>
          <NavItem to="/reports"  icon={FileText}  label="Reports"  collapsed={collapsed} />
          <NavItem to="/tutorial" icon={BookOpen}  label="Tutorial" collapsed={collapsed} />
          <NavItem to="/settings" icon={Settings}  label="Settings" collapsed={collapsed} />

          <div className="mt-2 pt-2" style={{ borderTop:'1px solid rgba(255,255,255,0.04)' }}>
            <ComingSoonNavItem
              icon={Wrench} label="Maintenance"
              badge="Soon" badgeColor="rgba(245,158,11,0.15)" badgeText="#f59e0b"
              collapsed={collapsed}
              onClick={() => setComingSoonModal('maintenance')}
            />
          </div>

          {hasRole(['admin']) && (
            <NavItem to="/admin" icon={Shield} label="Admin Panel" collapsed={collapsed}
              extraStyle={{ marginTop:'8px', borderColor:'rgba(255,255,255,0.04)' }} />
          )}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t flex-shrink-0" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
          <div className={`flex items-center gap-3 rounded-xl p-2.5 ${collapsed ? 'justify-center' : ''}`}
            style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div className="relative w-8 h-8 rounded-xl bg-yellow-400/15 border border-yellow-400/30
              flex items-center justify-center flex-shrink-0">
              <span className="text-yellow-400 font-display font-700 text-xs">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </span>
              {user?.is_default_admin && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center">
                  <span className="text-[7px] text-black font-900">★</span>
                </div>
              )}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  className="flex-1 min-w-0">
                  <div className="text-white text-sm font-display font-600 truncate">{user?.full_name}</div>
                  <span className={`text-[10px] font-mono ${rc.text}`}>
                    {user?.is_default_admin ? '★ Default Admin' : rc.label}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <button onClick={handleLogout}
                className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all flex-shrink-0"
                title="Logout">
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* ── COLLAPSE TOGGLE ── */}
      <motion.button
        onClick={() => setCollapsed(!collapsed)}
        whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.90 }}
        animate={{ left: collapsed ? 58 : 226 }}
        transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}
        className="fixed top-[72px] w-7 h-7 rounded-full flex items-center justify-center z-50"
        style={{
          background: 'linear-gradient(135deg, #1a2e48, #0d1f35)',
          border: '1.5px solid rgba(250,204,21,0.40)',
          boxShadow: '0 0 16px rgba(250,204,21,0.22), 0 2px 10px rgba(0,0,0,0.6)'
        }}>
        <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration:0.3, ease:'easeInOut' }}>
          <ChevronRight size={13} className="text-yellow-400" />
        </motion.div>
      </motion.button>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 flex-shrink-0"
          style={{ background:'rgba(4,10,20,0.85)', borderBottom:'1px solid rgba(255,255,255,0.05)', backdropFilter:'blur(12px)' }}>
          <div className="flex items-center gap-2">
            <span className="text-slate-700 text-xs font-mono">/</span>
            <h2 className="font-display font-700 text-white text-base capitalize">{pageTitle}</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* ✅ FIX: Real working search (removed dummy bell) */}
            <SmartSearch />
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono ${rc.bg} ${rc.text} border ${rc.border}`}>
              {user?.is_default_admin ? '★ Default Admin' : rc.label}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto page-enter">
            {children}
          </div>
        </main>
      </div>

      {/* Coming Soon Modal */}
      {comingSoonModal && (
        <ComingSoonModal
          pageKey={comingSoonModal}
          onClose={() => setComingSoonModal(null)}
        />
      )}
    </div>
  )
}