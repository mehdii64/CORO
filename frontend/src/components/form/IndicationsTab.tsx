import { api } from "../../api/reports"
import type { FullReport, Options, Doctor } from "../../types"

interface Props {
  full: FullReport; setFull: (f: FullReport) => void
  options: Options; doctors: Doctor[]; reportId: number
}

const inputCls = "border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white w-full"

export default function IndicationsTab({ full, setFull, options, reportId }: Props) {
  const indication = full.report.indication || ""
  const parts = indication.split(", ").filter(Boolean)

  async function toggleIndication(item: string) {
    const next = parts.includes(item)
      ? parts.filter(p => p !== item).join(", ")
      : [...parts, item].join(", ")
    const updated = await api.updateReport(reportId, { ...full.report, indication: next })
    setFull({ ...full, report: updated })
  }

  async function setFreeText(value: string) {
    const updated = await api.updateReport(reportId, { ...full.report, indication: value })
    setFull({ ...full, report: updated })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">Indications</h2>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-sm font-semibold text-slate-700 mb-3">Motif de l'examen</p>
        <div className="grid grid-cols-2 gap-y-2 gap-x-6">
          {options.indications.map(item => (
            <label key={item} className="flex items-center gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={parts.includes(item)}
                onChange={() => toggleIndication(item)}
                className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
              />
              <span className="text-slate-700">{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">Précisions / autre indication</span>
          <textarea
            rows={3}
            defaultValue={indication}
            onBlur={e => setFreeText(e.target.value)}
            className={inputCls}
            placeholder="Saisir une indication particulière…"
          />
        </label>
      </div>
    </div>
  )
}
