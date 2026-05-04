import { api } from "../../api/reports"
import type { FullReport, Options, Doctor } from "../../types"

interface Props {
  full: FullReport
  setFull: (f: FullReport) => void
  options: Options
  doctors: Doctor[]
  reportId: number
}

const TRUNK_OPTIONS = [
  { value: "normal", label: "Normal (pas de lésion significative)" },
  { value: "mono",   label: "Mono-tronculaire" },
  { value: "bi",     label: "Bi-tronculaire" },
  { value: "tri",    label: "Tri-tronculaire" },
  { value: "tronc",  label: "Atteinte du tronc commun" },
]

function autoDetectTrunk(lesions: FullReport["lesions"]): string {
  if (lesions.length === 0) return "normal"
  const arteries = new Set(lesions.map(l => {
    if (l.artery === "TCG") return "tronc"
    if (l.artery.startsWith("IVA")) return "iva"
    if (l.artery.startsWith("CX") || l.artery.startsWith("M")) return "cx"
    return "cd"
  }))
  if (arteries.has("tronc")) return "tronc"
  if (arteries.size >= 3) return "tri"
  if (arteries.size === 2) return "bi"
  return "mono"
}

export default function ConclusionTab({ full, setFull, options, reportId }: Props) {
  const c = full.conclusion || {} as Record<string, string>
  const suggested = autoDetectTrunk(full.lesions)

  async function saveConclusion(patch: object) {
    const updated = await api.updateConclusion(reportId, { ...c, ...patch })
    setFull({ ...full, conclusion: updated })
  }

  return (
    <div className="max-w-xl space-y-5">
      <h2 className="text-lg font-semibold">Conclusion</h2>

      <div>
        <p className="text-sm text-gray-600 mb-1 font-medium">Type d'atteinte coronaire</p>
        <p className="text-xs text-blue-600 mb-2">
          Suggestion automatique : <strong>{suggested}</strong>
        </p>
        {TRUNK_OPTIONS.map(opt => (
          <label key={opt.value} className="flex items-center gap-2 text-sm mb-1">
            <input
              type="radio"
              name="trunk"
              value={opt.value}
              checked={(c.trunk_disease || suggested) === opt.value}
              onChange={() => saveConclusion({ trunk_disease: opt.value })}
            />
            {opt.label}
          </label>
        ))}
      </div>

      <div>
        <p className="text-sm text-gray-600 mb-2 font-medium">Récapitulatif des lésions</p>
        {full.lesions.length === 0
          ? <p className="text-sm text-gray-400">Aucune lésion saisie.</p>
          : (
            <ul className="text-sm space-y-1">
              {full.lesions.map(l => (
                <li key={l.id} className="flex gap-2">
                  <span className="font-medium w-20">{l.artery}</span>
                  <span>{l.stenosis_pct}% — TIMI {l.timi}</span>
                  {l.notes && <span className="text-gray-500">({l.notes})</span>}
                </li>
              ))}
            </ul>
          )
        }
      </div>

      <div>
        <p className="text-sm text-gray-600 mb-1 font-medium">Décision thérapeutique</p>
        <div className="grid grid-cols-1 gap-1 mb-2">
          {options.decisions.map(d => (
            <label key={d} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="decision"
                value={d}
                checked={c.decision === d}
                onChange={() => saveConclusion({ decision: d })}
              />
              {d}
            </label>
          ))}
        </div>
        <textarea
          rows={2}
          placeholder="Précisions…"
          defaultValue={c.decision_notes || ""}
          onBlur={e => saveConclusion({ decision_notes: e.target.value })}
          className="border rounded px-2 py-1 w-full text-sm"
        />
      </div>
    </div>
  )
}
