import { api } from "../../api/reports"
import type { FullReport, Options, Doctor } from "../../types"

interface Props {
  full: FullReport; setFull: (f: FullReport) => void
  options: Options; doctors: Doctor[]; reportId: number
}

const inputCls = "border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white w-full"
const cardCls = "bg-white rounded-xl border border-slate-200 p-5"

export default function ConclusionTab({ full, setFull, options, reportId }: Props) {
  const c = full.conclusion || {} as Record<string, string>

  async function saveConclusion(patch: object) {
    const updated = await api.updateConclusion(reportId, { ...c, ...patch })
    setFull({ ...full, conclusion: updated })
  }

  function toggleDecision(d: string) {
    saveConclusion({ decision: c.decision === d ? "" : d })
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-slate-800">Conclusion</h2>

      {full.lesions.length > 0 && (
        <div className={cardCls}>
          <p className="text-sm font-semibold text-slate-700 mb-3">Récapitulatif des lésions</p>
          <ul className="space-y-2">
            {full.lesions.map(l => (
              <li key={l.id} className="flex items-start gap-3 text-sm">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 shrink-0">{l.artery}</span>
                <span className="text-slate-700">{l.stenosis_pct}% — TIMI {l.timi}{l.notes ? ` — ${l.notes}` : ""}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={cardCls}>
        <p className="text-sm font-semibold text-slate-700 mb-3">Décision thérapeutique</p>
        <div className="space-y-1 mb-4">
          {options.decisions.map(d => (
            <label key={d} className={`flex items-center gap-3 text-sm cursor-pointer p-2 rounded-lg transition-colors ${
              c.decision === d ? "bg-green-50 border border-green-200" : "hover:bg-slate-50"
            }`}>
              <input
                type="checkbox"
                checked={c.decision === d}
                onChange={() => toggleDecision(d)}
                className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-600"
              />
              <span className={c.decision === d ? "font-medium text-green-800" : "text-slate-700"}>{d}</span>
            </label>
          ))}
        </div>
        <textarea
          rows={2}
          placeholder="Précisions sur la décision…"
          defaultValue={c.decision_notes || ""}
          onBlur={e => saveConclusion({ decision_notes: e.target.value })}
          className={inputCls}
        />
      </div>
    </div>
  )
}
