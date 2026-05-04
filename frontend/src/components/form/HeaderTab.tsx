import { api } from "../../api/reports"
import type { FullReport, Options, Doctor } from "../../types"

interface Props {
  full: FullReport
  setFull: (f: FullReport) => void
  options: Options
  doctors: Doctor[]
  reportId: number
}

export default function HeaderTab({ full, setFull, doctors, reportId }: Props) {
  const r = full.report
  const operatorIds: number[] = JSON.parse(r.operators || "[]")

  async function save(field: string, value: string) {
    const updated = await api.updateReport(reportId, { ...r, [field]: value })
    setFull({ ...full, report: updated })
  }

  async function toggleOperator(doctorId: number) {
    const ids = operatorIds.includes(doctorId)
      ? operatorIds.filter(i => i !== doctorId)
      : [...operatorIds, doctorId]
    const updated = await api.updateReport(reportId, { ...r, operators: JSON.stringify(ids) })
    setFull({ ...full, report: updated })
  }

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-lg font-semibold">En-tête du compte rendu</h2>

      <div className="grid grid-cols-2 gap-3">
        {([
          ["Nom complet", "patient_name", "text"],
          ["Date de naissance", "dob", "date"],
          ["IPP", "ipp", "text"],
          ["Date examen", "exam_date", "date"],
        ] as const).map(([label, field, type]) => (
          <label key={field} className="flex flex-col text-sm">
            <span className="text-gray-600 mb-1">{label}</span>
            <input type={type}
              defaultValue={(r as Record<string, string>)[field] ?? ""}
              onBlur={e => save(field, e.target.value)}
              className="border rounded px-2 py-1" />
          </label>
        ))}
        <label className="flex flex-col text-sm">
          <span className="text-gray-600 mb-1">Sexe</span>
          <select defaultValue={r.sex}
            onChange={e => save("sex", e.target.value)}
            className="border rounded px-2 py-1">
            <option>Masculin</option><option>Féminin</option>
          </select>
        </label>
      </div>

      <div>
        <p className="text-sm text-gray-600 mb-2 font-medium">Opérateurs</p>
        <div className="flex flex-col gap-1">
          {doctors.filter(d => d.active).map(d => (
            <label key={d.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox"
                checked={operatorIds.includes(d.id)}
                onChange={() => toggleOperator(d.id)} />
              {d.name}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
