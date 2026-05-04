import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api/reports"
import type { Doctor, Options } from "../types"

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
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configuration</h1>
        <button onClick={() => nav("/")} className="text-blue-600 hover:underline text-sm">← Retour</button>
      </div>

      {/* Médecins */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Médecins du service</h2>
        <div className="space-y-2 mb-3">
          {doctors.map(d => (
            <div key={d.id} className="flex items-center justify-between border rounded px-3 py-2">
              <span className={`text-sm ${!d.active ? "text-gray-400 line-through" : ""}`}>{d.name}</span>
              <button onClick={() => toggleDoctorActive(d)}
                className="text-xs text-blue-600 hover:underline">
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
            className="border rounded px-2 py-1 text-sm flex-1"
          />
          <button onClick={addDoctor}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
            Ajouter
          </button>
        </div>
      </section>

      {/* Listes éditables */}
      {options && editableKeys.map(({ key, label }) => (
        <section key={key as string}>
          <h2 className="text-lg font-semibold mb-2">{label}</h2>
          <div className="space-y-1 mb-2">
            {(options[key] as string[]).map((item: string) => (
              <div key={item} className="flex items-center justify-between text-sm border-b py-1">
                <span>{item}</span>
                <button onClick={() => removeOptionItem(key, item)}
                  className="text-red-400 hover:text-red-600 text-xs">Supprimer</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newItem[key as string] || ""}
              onChange={e => setNewItem(prev => ({ ...prev, [key]: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && addOptionItem(key)}
              placeholder="Nouvelle entrée…"
              className="border rounded px-2 py-1 text-sm flex-1"
            />
            <button onClick={() => addOptionItem(key)}
              className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300">+</button>
          </div>
        </section>
      ))}
    </div>
  )
}
