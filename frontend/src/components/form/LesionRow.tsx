import { api } from "../../api/reports"
import type { FullReport, Lesion } from "../../types"

interface Props {
  reportId: number
  full: FullReport
  setFull: (f: FullReport) => void
  artery: string
  label: string
}

const STENOSIS_OPTIONS: { value: string; label: string }[] = [
  { value: "50-70", label: "50-70% (intermédiaire)" },
  { value: "70-90", label: "70-90% (serrée)" },
  { value: "90-99", label: "90-99% (sub-occlusive)" },
  { value: "100",   label: "100% (occlusion)" },
]

const selectCls = "border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"

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
      occlusion_type: "",
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
    // 100% stenosis ⇒ flow is always TIMI 0
    if (patch.stenosis_pct === "100") {
      patch = { ...patch, timi: 0 }
    }
    // Reset occlusion_type when leaving 100%
    if (patch.stenosis_pct && patch.stenosis_pct !== "100" && lesion.stenosis_pct === "100") {
      patch = { ...patch, occlusion_type: "" }
    }
    const updated = await api.updateLesion(reportId, lesion.id, { ...lesion, ...patch })
    setFull({ ...full, lesions: full.lesions.map(l => l.id === lesion.id ? updated : l) })
  }

  const isOcclusion = lesion?.stenosis_pct === "100"

  return (
    <div className={`flex flex-wrap items-center gap-2 py-2.5 border-b border-slate-200 last:border-0 transition-colors ${lesion ? "-mx-4 px-4 bg-amber-50" : ""}`}>
      <label className="flex items-center gap-2 cursor-pointer shrink-0">
        <input
          type="checkbox"
          checked={!!lesion}
          onChange={lesion ? removeLesion : addLesion}
          className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
        />
        <span className={`text-sm w-32 ${lesion ? "font-semibold text-amber-800" : "text-slate-600"}`}>{label}</span>
      </label>

      {lesion && (
        <>
          <select
            value={lesion.stenosis_pct}
            onChange={e => updateLesion({ stenosis_pct: e.target.value })}
            className={selectCls}
          >
            {STENOSIS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {isOcclusion && (
            <select
              value={lesion.occlusion_type || ""}
              onChange={e => updateLesion({ occlusion_type: e.target.value })}
              className={`${selectCls} ${!lesion.occlusion_type ? "border-red-400 bg-red-50" : ""}`}
              title="Type d'occlusion"
            >
              <option value="">Type d'occlusion ?</option>
              <option value="aigue">Occlusion aiguë</option>
              <option value="chronique">CTO (chronique)</option>
            </select>
          )}

          <label className="text-xs flex items-center gap-1 text-slate-600">
            TIMI
            <select
              value={lesion.timi}
              onChange={e => updateLesion({ timi: Number(e.target.value) })}
              disabled={isOcclusion}
              className={`${selectCls} ${isOcclusion ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {[0, 1, 2, 3].map(n => <option key={n}>{n}</option>)}
            </select>
          </label>
          <input
            placeholder="Notes (excentrée, calcifiée…)"
            value={lesion.notes}
            onChange={e => updateLesion({ notes: e.target.value })}
            className="border border-slate-300 rounded-md px-2 py-1 text-xs flex-1 min-w-36 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
          />
        </>
      )}
    </div>
  )
}
