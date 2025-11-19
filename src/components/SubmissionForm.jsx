import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, Loader2, Trash2 } from 'lucide-react'

const categories = [
  { label: 'Misunderstanding', color: 'bg-red-500/20 text-red-300 ring-red-500/30' },
  { label: 'Too Verbose', color: 'bg-yellow-500/20 text-yellow-200 ring-yellow-500/30' },
  { label: 'Inaccurate', color: 'bg-orange-500/20 text-orange-200 ring-orange-500/30' },
  { label: 'Missing Context', color: 'bg-blue-500/20 text-blue-200 ring-blue-500/30' },
  { label: 'Hallucination', color: 'bg-pink-500/20 text-pink-200 ring-pink-500/30' },
  { label: 'Tone', color: 'bg-purple-500/20 text-purple-200 ring-purple-500/30' },
  { label: 'Other', color: 'bg-slate-500/20 text-slate-200 ring-slate-500/30' },
]

function AutoTextarea({ value, onChange, placeholder, maxLength, rows=3, id }) {
  const [height, setHeight] = useState('auto')
  const [text, setText] = useState(value || '')

  useEffect(() => {
    setText(value || '')
  }, [value])

  useEffect(() => {
    const el = document.getElementById(id)
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
    setHeight(`${el.scrollHeight}px`)
  }, [text, id])

  const remaining = useMemo(() => (maxLength ? (maxLength - (text?.length || 0)) : null), [text, maxLength])

  return (
    <div>
      <textarea
        id={id}
        value={text}
        onChange={(e) => { setText(e.target.value); onChange && onChange(e) }}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none bg-slate-800/70 text-white placeholder:text-slate-400 rounded-xl p-4 border border-white/10 focus:border-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 shadow-inner"
        style={{ height }}
        maxLength={maxLength}
      />
      {maxLength && (
        <div className="text-xs text-slate-400 mt-1 text-right">{remaining} characters remaining</div>
      )}
    </div>
  )
}

export default function SubmissionForm({ onSubmitted }) {
  const [form, setForm] = useState({ question: '', response: '', improvement: '', category: 'Misunderstanding' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showClear, setShowClear] = useState(false)
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const currentCategory = categories.find(c => c.label === form.category)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSuccess(false)
    try {
      const res = await fetch(`${baseUrl}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSuccess(true)
      setShowClear(true)
      onSubmitted && onSubmitted()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const clearForm = () => {
    setForm({ question: '', response: '', improvement: '', category: 'Misunderstanding' })
    setSuccess(false)
  }

  return (
    <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 sm:p-8 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <span className={`px-2.5 py-1 rounded-full text-xs ring-1 ${currentCategory.color}`}>{form.category}</span>
      </div>

      <div className="grid gap-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-purple-200">What was the user's original question?</label>
            <span className="text-xs text-slate-400">{form.question.length}/2000</span>
          </div>
          <AutoTextarea id="q" value={form.question} onChange={(e)=>setForm({ ...form, question: e.target.value })} placeholder="Paste the original user question here..." maxLength={2000} />
        </div>

        <div>
          <label className="text-sm text-purple-200 mb-2 block">What was Claude's response?</label>
          <AutoTextarea id="r" value={form.response} onChange={(e)=>setForm({ ...form, response: e.target.value })} placeholder="Paste Claude's response..." rows={5} maxLength={20000} />
        </div>

        <div>
          <label className="text-sm text-purple-200 mb-2 block">What should Claude have done better?</label>
          <AutoTextarea id="i" value={form.improvement} onChange={(e)=>setForm({ ...form, improvement: e.target.value })} placeholder="Describe the ideal answer and what to improve..." rows={4} maxLength={20000} />
        </div>

        <div className="relative">
          <label className="text-sm text-purple-200 mb-2 block">Issue Category</label>
          <details className="group">
            <summary className="list-none flex items-center justify-between bg-slate-800/70 text-white rounded-xl px-4 py-3 border border-white/10 cursor-pointer hover:border-purple-400/40 transition-all">
              <span>{form.category}</span>
              <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
            </summary>
            <AnimatePresence>
              <motion.ul initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="mt-2 bg-slate-800/90 backdrop-blur rounded-xl border border-white/10 overflow-hidden shadow-lg">
                {categories.map((c) => (
                  <li key={c.label}>
                    <button type="button" onClick={() => setForm({ ...form, category: c.label })} className="w-full text-left px-4 py-2.5 hover:bg-white/10 flex items-center justify-between">
                      <span className="text-sm text-white">{c.label}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ring-1 ${c.color}`}>{c.label}</span>
                    </button>
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </details>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={submitting} className={`relative inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-medium transition focus:outline-none ring-1 ring-white/10 ${success ? 'bg-emerald-600 hover:bg-emerald-600' : 'bg-purple-600 hover:bg-purple-500'}`}>
            <AnimatePresence initial={false} mode="popLayout">
              {submitting ? (
                <motion.span key="loading" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting
                </motion.span>
              ) : success ? (
                <motion.span key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <Check className="w-4 h-4" /> Submitted
                </motion.span>
              ) : (
                <motion.span key="label" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>Submit Feedback</motion.span>
              )}
            </AnimatePresence>
          </button>

          {showClear && (
            <button type="button" onClick={clearForm} className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-white/90 hover:text-white bg-white/5 hover:bg-white/10 transition ring-1 ring-white/10">
              <Trash2 className="w-4 h-4" /> Clear Form
            </button>
          )}
        </div>

        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-emerald-300 bg-emerald-500/10 ring-1 ring-emerald-500/20 rounded-xl px-4 py-3">
              Feedback submitted successfully!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.form>
  )
}
