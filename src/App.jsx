import { useState } from 'react'
import Header from './components/Header'
import SubmissionForm from './components/SubmissionForm'
import Dashboard from './components/Dashboard'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [page, setPage] = useState('form')

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-[#0b0e1a] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Header onNavigate={setPage} active={page} />

        <div className="pb-20">
          <div className="flex items-center gap-2 text-xs text-purple-200/70 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span>Database connected</span>
          </div>

          <AnimatePresence mode="wait">
            {page === 'form' ? (
              <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <SubmissionForm onSubmitted={() => setPage('dashboard')} />
              </motion.div>
            ) : (
              <motion.div key="dash" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <Dashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default App
