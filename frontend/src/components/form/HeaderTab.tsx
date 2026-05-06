import { api } from "../../api/reports"
import type { FullReport, Options, Doctor } from "../../types"

interface Props {
  full: FullReport
  setFull: (f: FullReport) => void
  options: Options
  doctors: Doctor[]
  reportId: number
}

const inputCls = "border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white w-full"

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
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">En-tête du compte rendu</h2>

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Nom complet du patient</span>
            <input
              type="text"
              defaultValue={r.patient_name ?? ""}
              onBlur={e => save("patient_name", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Date</span>
            <input
              type="date"
              defaultValue={r.exam_date ?? ""}
              onBlur={e => save("exam_date", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Sexe</span>
            <select
              defaultValue={r.sex}
              onChange={e => save("sex", e.target.value)}
              className={inputCls}
            >
              <option>Masculin</option>
              <option>Féminin</option>
            </select>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-sm font-semibold text-slate-700 mb-3">Opérateurs</p>
        <div className="grid grid-cols-2 gap-2">
          {doctors.filter(d => d.active).map(d => (
            <label key={d.id} className="flex items-center gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={operatorIds.includes(d.id)}
                onChange={() => toggleOperator(d.id)}
                className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
              />
              <span className="text-slate-700">{d.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
