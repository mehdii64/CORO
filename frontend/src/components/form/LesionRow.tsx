import { api } from "../../api/reports"
import type { FullReport, Lesion } from "../../types"

interface Props {
  reportId: number
  full: FullReport
  setFull: (f: FullReport) => void
  artery: string
  label: string
}

const STENOSIS_OPTIONS = ["50-70", "70-90", "90-99", "100"]

export default function LesionRow({ reportId, full, setFull, artery, label }: Props) {
  const lesion = full.lesions.find(l => l.artery === artery)

  async function addLesion() {
    const l = await api.addLesion(reportId, {
      artery,
      stenosis_pct: "70-90",
      timi: 3,
      good_distal_bed: true,
      notes: "",
      position: full.lesions.length,
    })
    setFull({ ...full, lesions: [...full.lesions, l] })
  }

  async function removeLesion() {
    if (!lesion) return
    await api.deleteLesion(reportId, lesion.id)
    setFull({ ...full, lesions: full.lesions.filter(l => l.artery !== artery) })
  }

  async function updateLesion(patch: Partial<Lesion>) {
    if (!lesion) return
    const updated = await api.updateLesion(reportId, lesion.id, { ...lesion, ...patch })
    setFull({ ...full, lesions: full.lesions.map(l => l.id === lesion.id ? updated : l) })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-2 border-b last:border-0">
      <span className="w-36 text-sm font-medium">{label}</span>
      <label className="flex items-center gap-1 text-sm">
        <input
          type="checkbox"
          checked={!!lesion}
          onChange={lesion ? removeLesion : addLesion}
        />
        Lésion
      </label>
      {lesion && (
        <>
          <select
            value={lesion.stenosis_pct}
            onChange={e => updateLesion({ stenosis_pct: e.target.value })}
            className="border rounded px-1 py-0.5 text-sm"
          >
            {STENOSIS_OPTIONS.map(s => <option key={s}>{s}%</option>)}
          </select>
          <label className="text-sm flex items-center gap-1">
            TIMI
            <select
              value={lesion.timi}
              onChange={e => updateLesion({ timi: Number(e.target.value) })}
              className="border rounded px-1 py-0.5 text-sm"
            >
              {[0, 1, 2, 3].map(n => <option key={n}>{n}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={lesion.good_distal_bed}
              onChange={e => updateLesion({ good_distal_bed: e.target.checked })}
            />
            Bon lit d'aval
          </label>
          <input
            placeholder="Notes (excentrée, calcifiée…)"
            value={lesion.notes}
            onChange={e => updateLesion({ notes: e.target.value })}
            className="border rounded px-2 py-0.5 text-sm flex-1 min-w-40"
          />
        </>
      )}
    </div>
  )
}
