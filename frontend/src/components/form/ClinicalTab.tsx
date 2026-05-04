import { api } from "../../api/reports"
import type { FullReport, Options, Doctor } from "../../types"

interface Props {
  full: FullReport; setFull: (f: FullReport) => void
  options: Options; doctors: Doctor[]; reportId: number
}

export default function ClinicalTab({ full, setFull, options, reportId }: Props) {
  const c = full.clinical || {} as Record<string, unknown>
  const fdrcxList: string[] = JSON.parse((c.fdrcx as string) || "[]")

  async function saveClinical(patch: object) {
    const updated = await api.updateClinical(reportId, { ...c, ...patch })
    setFull({ ...full, clinical: updated })
  }

  async function toggleFdrcx(item: string) {
    const next = fdrcxList.includes(item)
      ? fdrcxList.filter(i => i !== item)
      : [...fdrcxList, item]
    await saveClinical({ fdrcx: JSON.stringify(next) })
  }

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-lg font-semibold">Statut Clinique</h2>

      <label className="flex flex-col text-sm">
        <span className="text-gray-600 mb-1">Âge</span>
        <input type="number" defaultValue={(c.age as number) ?? ""}
          onBlur={e => saveClinical({ age: Number(e.target.value) || null })}
          className="border rounded px-2 py-1 w-24" />
      </label>

      <div>
        <p className="text-sm text-gray-600 mb-1 font-medium">Facteurs de risque cardiovasculaire</p>
        <div className="grid grid-cols-2 gap-1 mb-2">
          {options.fdrcx.map(item => (
            <label key={item} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={fdrcxList.includes(item)} onChange={() => toggleFdrcx(item)} />
              {item}
            </label>
          ))}
        </div>
        <textarea rows={2} placeholder="Précisions (dosages, HbA1c…)"
          defaultValue={(c.fdrcx_notes as string) || ""}
          onBlur={e => saveClinical({ fdrcx_notes: e.target.value })}
          className="border rounded px-2 py-1 w-full text-sm" />
      </div>

      {([
        ["atcd", "Antécédents"],
        ["hm", "Histoire de la maladie"],
        ["ecg", "ECG"],
        ["ett_notes", "ETT (description)"],
      ] as const).map(([field, label]) => (
        <label key={field} className="flex flex-col text-sm">
          <span className="text-gray-600 mb-1">{label}</span>
          <textarea rows={3} defaultValue={(c[field] as string) || ""}
            onBlur={e => saveClinical({ [field]: e.target.value })}
            className="border rounded px-2 py-1" />
        </label>
      ))}

      <label className="flex flex-col text-sm">
        <span className="text-gray-600 mb-1">FEVG (%)</span>
        <input type="number" defaultValue={(c.ett_fevg as number) ?? ""}
          onBlur={e => saveClinical({ ett_fevg: Number(e.target.value) || null })}
          className="border rounded px-2 py-1 w-24" />
      </label>
    </div>
  )
}
