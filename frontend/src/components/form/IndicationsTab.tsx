import { api } from "../../api/reports"
import type { FullReport, Options, Doctor } from "../../types"

interface Props {
  full: FullReport; setFull: (f: FullReport) => void
  options: Options; doctors: Doctor[]; reportId: number
}

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
    <div className="max-w-lg space-y-4">
      <h2 className="text-lg font-semibold">Indications</h2>
      <div className="grid grid-cols-2 gap-2">
        {options.indications.map(item => (
          <label key={item} className="flex items-center gap-2 text-sm">
            <input type="checkbox"
              checked={parts.includes(item)}
              onChange={() => toggleIndication(item)} />
            {item}
          </label>
        ))}
      </div>
      <label className="flex flex-col text-sm">
        <span className="text-gray-600 mb-1">Précisions / autre</span>
        <textarea rows={2}
          defaultValue={indication}
          onBlur={e => setFreeText(e.target.value)}
          className="border rounded px-2 py-1" />
      </label>
    </div>
  )
}
