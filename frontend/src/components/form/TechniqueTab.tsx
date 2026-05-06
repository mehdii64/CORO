import { useEffect, useState } from "react"
import { api } from "../../api/reports"
import type { FullReport, Options, Doctor } from "../../types"

interface Props {
  full: FullReport; setFull: (f: FullReport) => void
  options: Options; doctors: Doctor[]; reportId: number
}

const inputCls = "border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white w-full"
const cardCls = "bg-white rounded-xl border border-slate-200 p-5"

export default function TechniqueTab({ full, setFull, options, reportId }: Props) {
  const t = full.technique || {} as Record<string, unknown>
  const [newMat, setNewMat] = useState("")
  const rawMaterial = (t.material as string) || ""
  const material: string[] = JSON.parse(rawMaterial || "[]")

  async function saveTech(patch: object) {
    const updated = await api.updateTechnique(reportId, { ...t, ...patch })
    setFull({ ...full, technique: updated })
  }

  // First time the technique is loaded with no material, pre-check default items.
  useEffect(() => {
    const defaults = options.default_material ?? []
    if (rawMaterial === "" && defaults.length > 0) {
      saveTech({ material: JSON.stringify(defaults) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawMaterial])

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
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-slate-800">Technique</h2>

      <div className={cardCls + " space-y-4"}>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-slate-700">Salle</span>
          <select
            defaultValue={(t.room as string) || options.rooms[0]}
            onChange={e => saveTech({ room: e.target.value })}
            className={inputCls}
          >
            {options.rooms.map(r => <option key={r}>{r}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-slate-700">Voie d'abord</span>
          <select
            defaultValue={(t.approach as string) || options.approaches[0]}
            onChange={e => saveTech({ approach: e.target.value })}
            className={inputCls}
          >
            {options.approaches.map(a => <option key={a}>{a}</option>)}
          </select>
        </label>

        <div className="grid grid-cols-3 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-slate-700">French</span>
            <select
              defaultValue={(t.french_size as number) || 6}
              onChange={e => saveTech({ french_size: Number(e.target.value) })}
              className={inputCls}
            >
              {options.french_sizes.map(f => <option key={f}>{f}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-slate-700">PDC (cc)</span>
            <input
              type="number"
              defaultValue={(t.contrast_cc as number) ?? ""}
              onBlur={e => saveTech({ contrast_cc: Number(e.target.value) || null })}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-slate-700">Dose (mGy)</span>
            <input
              type="number"
              defaultValue={(t.dose_mgy as number) ?? ""}
              onBlur={e => saveTech({ dose_mgy: Number(e.target.value) || null })}
              className={inputCls}
            />
          </label>
        </div>
      </div>

      <div className={cardCls}>
        <p className="text-sm font-semibold text-slate-700 mb-3">Matériel utilisé</p>
        <div className="space-y-2 mb-4">
          {options.material.map(item => (
            <label key={item} className="flex items-center gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={material.includes(item)}
                onChange={() => toggleMaterial(item)}
                className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
              />
              <span className="text-slate-700">{item}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newMat}
            onChange={e => setNewMat(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCustomMaterial()}
            placeholder="Ajouter un matériel personnalisé…"
            className={inputCls}
          />
          <button
            onClick={addCustomMaterial}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 rounded-lg text-sm font-medium transition-colors shrink-0"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
