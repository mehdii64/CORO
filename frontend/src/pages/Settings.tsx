import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api/reports"
import type { Doctor, Options } from "../types"

const cardCls = "bg-white rounded-xl border border-slate-200 p-5"
const inputCls = "border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white w-full"

export default function Settings() {
  const nav = useNavigate()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [newDoctorName, setNewDoctorName] = useState("")
  const [options, setOptions] = useState<Options | null>(null)
  const [newItem, setNewItem] = useState<Record<string, string>>({})

  useEffect(() => {
    api.getDoctors().then(setDoctors)
    api.getOptions().then(setOptions)
  }, [])

  async function addDoctor() {
    if (!newDoctorName.trim()) return
    const d = await api.createDoctor({ name: newDoctorName.trim(), active: true })
    setDoctors(prev => [...prev, d])
    setNewDoctorName("")
  }

  async function toggleDoctorActive(d: Doctor) {
    const updated = await api.updateDoctor(d.id, { ...d, active: !d.active })
    setDoctors(prev => prev.map(doc => doc.id === d.id ? updated : doc))
  }

  async function removeOptionItem(key: keyof Options, item: string) {
    if (!options) return
    const current = options[key] as string[]
    const next = current.filter((i: string) => i !== item)
    const updated = await api.updateOption(key as string, next)
    setOptions(updated)
  }

  async function addOptionItem(key: keyof Options) {
    if (!options || !newItem[key as string]?.trim()) return
    const current = options[key] as string[]
    const next = [...current, newItem[key as string].trim()]
    const updated = await api.updateOption(key as string, next)
    setOptions(updated)
    setNewItem(prev => ({ ...prev, [key]: "" }))
  }

  const editableKeys: { key: keyof Options; label: string }[] = [
    { key: "rooms", label: "Salles" },
    { key: "approaches", label: "Voies d'abord" },
    { key: "material", label: "Matériel" },
    { key: "indications", label: "Indications" },
    { key: "decisions", label: "Décisions" },
  ]

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => nav("/")} className="text-slate-500 hover:text-slate-700 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Configuration</h1>
      </div>

      {/* Médecins */}
      <div className={cardCls}>
        <h2 className="text-base font-semibold text-slate-800 mb-4">Médecins du service</h2>
        <div className="space-y-1 mb-4">
          {doctors.map(d => (
            <div key={d.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className={`text-sm ${!d.active ? "text-slate-400 line-through" : "text-slate-700"}`}>{d.name}</span>
              <button
                onClick={() => toggleDoctorActive(d)}
                className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                  d.active
                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {d.active ? "Désactiver" : "Réactiver"}
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newDoctorName}
            onChange={e => setNewDoctorName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addDoctor()}
            placeholder="Dr Nom Prénom"
            className={inputCls}
          />
          <button
            onClick={addDoctor}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shrink-0"
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Listes éditables */}
      {options && editableKeys.map(({ key, label }) => (
        <div key={key as string} className={cardCls}>
          <h2 className="text-base font-semibold text-slate-800 mb-4">{label}</h2>
          <div className="space-y-1 mb-4">
            {(options[key] as string[]).map((item: string) => (
              <div key={item} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-700">{item}</span>
                <button
                  onClick={() => removeOptionItem(key, item)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors font-medium"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newItem[key as string] || ""}
              onChange={e => setNewItem(prev => ({ ...prev, [key]: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && addOptionItem(key)}
              placeholder="Nouvelle entrée…"
              className={inputCls}
            />
            <button
              onClick={() => addOptionItem(key)}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
            >
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
