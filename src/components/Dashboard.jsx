import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Clock3, Copy, Layers, Search, Sparkles } from 'lucide-react'

const badgeColors = {
  'Misunderstanding': 'bg-red-500/20 text-red-300 ring-red-500/30',
  'Too Verbose': 'bg-yellow-500/20 text-yellow-200 ring-yellow-500/30',
  'Inaccurate': 'bg-orange-500/20 text-orange-200 ring-orange-500/30',
  'Missing Context': 'bg-blue-500/20 text-blue-200 ring-blue-500/30',
  'Hallucination': 'bg-pink-500/20 text-pink-200 ring-pink-500/30',
  'Tone': 'bg-purple-500/20 text-purple-200 ring-purple-500/30',
  'Other': 'bg-slate-500/20 text-slate-200 ring-slate-500/30'
}

function Chart({ data }) {
  const total = Object.values(data || {}).reduce((a, b) => a + b, 0)
  const items = Object.entries(data || {})
  const palette = ['#ef4444','#f59e0b','#fb7185','#6366f1','#22d3ee','#a78bfa','#38bdf8']
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-end gap-2 h-44">
        {items.map(([k, v], i) => (
          <motion.div key={k} initial={{ height: 0, opacity: 0 }} animate={{ height: `${(v/total)*100 || 0}%`, opacity: 1 }} transition={{ duration: 0.6, delay: i*0.05 }} className="flex-1">
            <div className="w-full rounded-t-md" style={{ background: palette[i % palette.length], height: '100%' }} />
            <div className="text-xs mt-2 text-center text-purple-200/80">{k}</div>
            <div className="text-[10px] text-center text-slate-400">{v}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function Typewriter({ text }) {
  const [display, setDisplay] = useState('')
  useEffect(() => {
    setDisplay('')
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplay(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, 15)
    return () => clearInterval(id)
  }, [text])
  return <div className="whitespace-pre-wrap">{display}</div>
}

export default function Dashboard() {
  const [scope, setScope] = useState('all')
  const [items, setItems] = useState([])
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const fetchData = async () => {
    const res = await fetch(`${baseUrl}/api/feedback?limit=200`)
    const data = await res.json()
    setItems(data)
    const sumRes = await fetch(`${baseUrl}/api/analytics/summary`)
    const sum = await sumRes.json()
    setSummary('')
    setLoading(true)
    const insightRes = await fetch(`${baseUrl}/api/analytics/insights`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: data, scope })
    })
    const insight = await insightRes.json()
    setSummary(insight.summary)
    setLoading(false)
    setBreakdown(sum.breakdown || {})
  }

  const [breakdown, setBreakdown] = useState({})

  useEffect(() => { fetchData() }, [scope])

  const total = items.length
  const filtered = useMemo(() => items.filter(it => (it.question+it.response+it.improvement).toLowerCase().includes(search.toLowerCase())), [items, search])

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary)
    } catch {}
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-slate-300 text-sm">Total Submissions</div>
              <div className="text-5xl font-semibold text-white">{total}</div>
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl ring-1 ring-white/10">
              <button className={`px-3 py-1.5 rounded-lg text-sm ${scope==='week'?'bg-purple-500/40 text-white':'text-purple-200 hover:bg-white/10'}`} onClick={()=>setScope('week')}>This Week</button>
              <button className={`px-3 py-1.5 rounded-lg text-sm ${scope==='all'?'bg-purple-500/40 text-white':'text-purple-200 hover:bg-white/10'}`} onClick={()=>setScope('all')}>All Time</button>
            </div>
          </div>
          <div className="mt-6">
            <Chart data={breakdown} />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium">Recent Submissions</h3>
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1 ring-1 ring-white/10">
              <Search className="w-4 h-4 text-purple-200/80" />
              <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search" className="bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <AnimatePresence>
            {filtered.map((it) => (
              <motion.details key={it.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="group bg-white/5 rounded-xl p-4 ring-1 ring-white/10">
                <summary className="list-none cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="text-white/90 font-medium line-clamp-1">{it.question}</div>
                    <span className={`ml-3 text-[10px] px-2 py-0.5 rounded-full ring-1 ${badgeColors[it.category]}`}>{it.category}</span>
                  </div>
                </summary>
                <div className="mt-3 text-sm text-purple-200/85">
                  <div className="mb-2">
                    <div className="text-slate-400 text-xs">Claude's response</div>
                    <div className="bg-black/20 rounded p-2 max-h-40 overflow-auto">{it.response}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Suggested improvement</div>
                    <div className="bg-black/20 rounded p-2 max-h-40 overflow-auto">{it.improvement}</div>
                  </div>
                </div>
              </motion.details>
            ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-br from-purple-700/40 to-blue-700/30 border border-purple-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-medium flex items-center gap-2"><Sparkles className="w-4 h-4"/> AI Insights</h3>
            <button onClick={copySummary} className="inline-flex items-center gap-1 text-xs text-white/90 bg-white/10 hover:bg-white/20 px-2 py-1 rounded">
              <Copy className="w-3 h-3"/> Copy
            </button>
          </div>
          <div className="min-h-[120px] bg-black/20 rounded-xl p-3 ring-1 ring-white/10">
            {loading ? (
              <div className="flex items-center gap-2 text-purple-200"><span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"/> Generating...</div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-purple-100 text-sm">
                  <Typewriter text={summary} />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-medium mb-2">What is this?</h3>
          <p className="text-sm text-purple-200/80">Submit feedback about answers. The dashboard highlights patterns and suggests improvements to guide prompt and model tuning.</p>
        </div>
      </div>
    </div>
  )
}
