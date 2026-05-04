import { useState } from "react"
import { api } from "../../api/reports"
import type { FullReport, Options, Doctor } from "../../types"

interface Props {
  full: FullReport; setFull: (f: FullReport) => void
  options: Options; doctors: Doctor[]; reportId: number
}

export default function TechniqueTab({ full, setFull, options, reportId }: Props) {
  const t = full.technique || {} as Record<string, unknown>
  const [newMat, setNewMat] = useState("")
  const material: string[] = JSON.parse((t.material as string) || "[]")

  async function saveTech(patch: object) {
    const updated = await api.updateTechnique(reportId, { ...t, ...patch })
    setFull({ ...full, technique: updated })
  }

  async function toggleMaterial(item: string) {
    const next = material.includes(item)
      ? material.filter(m => m !== item)
      : [...material, item]
    await saveTech({ material: JSON.stringify(next) })
  }

  async function addCustomMaterial() {
    if (!newMat.trim()) return
    const next = [...material, newMat.trim()]
    await saveTech({ material: JSON.stringify(next) })
    setNewMat("")
  }

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-lg font-semibold">Technique</h2>

      <label className="flex flex-col text-sm">
        <span className="text-gray-600 mb-1">Salle</span>
        <select defaultValue={(t.room as string) || options.rooms[0]}
          onChange={e => saveTech({ room: e.target.value })}
          className="border rounded px-2 py-1">
          {options.rooms.map(r => <option key={r}>{r}</option>)}
        </select>
      </label>

      <label className="flex flex-col text-sm">
        <span className="text-gray-600 mb-1">Voie d'abord</span>
        <select defaultValue={(t.approach as string) || options.approaches[0]}
          onChange={e => saveTech({ approach: e.target.value })}
          className="border rounded px-2 py-1">
          {options.approaches.map(a => <option key={a}>{a}</option>)}
        </select>
      </label>

      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col text-sm">
          <span className="text-gray-600 mb-1">French</span>
          <select defaultValue={(t.french_size as number) || 6}
            onChange={e => saveTech({ french_size: Number(e.target.value) })}
            className="border rounded px-2 py-1">
            {options.french_sizes.map(f => <option key={f}>{f}</option>)}
          </select>
        </label>
        <label className="flex flex-col text-sm">
          <span className="text-gray-600 mb-1">PDC (cc)</span>
          <input type="number" defaultValue={(t.contrast_cc as number) ?? ""}
            onBlur={e => saveTech({ contrast_cc: Number(e.target.value) || null })}
            className="border rounded px-2 py-1" />
        </label>
        <label className="flex flex-col text-sm">
          <span className="text-gray-600 mb-1">Dose (mGy)</span>
          <input type="number" defaultValue={(t.dose_mgy as number) ?? ""}
            onBlur={e => saveTech({ dose_mgy: Number(e.target.value) || null })}
            className="border rounded px-2 py-1" />
        </label>
      </div>

      <div>
        <p className="text-sm text-gray-600 mb-2 font-medium">Matériel utilisé</p>
        <div className="space-y-1 mb-3">
          {options.material.map(item => (
            <label key={item} className="flex items-center gap-2 text-sm">
              <input type="checkbox"
                checked={material.includes(item)}
                onChange={() => toggleMaterial(item)} />
              {item}
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newMat} onChange={e => setNewMat(e.target.value)}
            placeholder="Ajouter un matériel..."
            className="border rounded px-2 py-1 text-sm flex-1" />
          <button onClick={addCustomMaterial}
            className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300">+</button>
        </div>
      </div>
    </div>
  )
}
