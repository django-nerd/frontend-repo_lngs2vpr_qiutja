import { Flame, BarChart3, ClipboardList, Sparkles } from 'lucide-react'
import Spline from '@splinetool/react-spline'
import { motion } from 'framer-motion'

export default function Header({ onNavigate, active }) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-60">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="relative z-10">
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-purple-900/40">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">Claude Feedback Analyzer</h1>
              <p className="text-xs sm:text-sm text-purple-200/80">by Flames.blue</p>
            </div>
          </div>

          <nav className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1 backdrop-blur">
            <button onClick={() => onNavigate('form')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${active==='form' ? 'bg-purple-500/40 text-white' : 'text-purple-200 hover:bg-white/10'}`}>
              <ClipboardList className="w-4 h-4" /> Submit
            </button>
            <button onClick={() => onNavigate('dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${active==='dashboard' ? 'bg-purple-500/40 text-white' : 'text-purple-200 hover:bg-white/10'}`}>
              <BarChart3 className="w-4 h-4" /> Dashboard
            </button>
          </nav>
        </header>

        <div className="pt-6 pb-10">
          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-2xl sm:text-4xl md:text-5xl font-semibold text-white/90 max-w-3xl">
            Turn raw feedback into actionable insights.
          </motion.h2>
          <p className="text-purple-200/80 mt-3 max-w-2xl">
            Submit real conversations and see trend breakdowns, recent cases, and AI-assisted summaries.
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/90" />
    </div>
  )
}
