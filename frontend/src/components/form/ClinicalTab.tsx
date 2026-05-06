import { api } from "../../api/reports"
import type { FullReport, Options, Doctor } from "../../types"

interface Props {
  full: FullReport; setFull: (f: FullReport) => void
  options: Options; doctors: Doctor[]; reportId: number
}

const inputCls = "border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white w-full"
const cardCls = "bg-white rounded-xl border border-slate-200 p-5"

const ETT_QUICK_PHRASE = "VG non dilaté, à parois non hypertrophiées"

export default function ClinicalTab({ full, setFull, options, reportId }: Props) {
  const c = full.clinical || {} as Record<string, unknown>
  const fdrcxList: string[] = JSON.parse((c.fdrcx as string) || "[]")
  const ettNotes = (c.ett_notes as string) || ""
  const hasQuickPhrase = ettNotes.includes(ETT_QUICK_PHRASE)

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

  async function toggleQuickPhrase() {
    let next: string
    if (hasQuickPhrase) {
      next = ettNotes.replace(ETT_QUICK_PHRASE, "").replace(/\s*\.\s*\./g, ".").trim()
      next = next.replace(/^[\s.,;]+/, "")
    } else {
      next = ettNotes.trim()
        ? `${ETT_QUICK_PHRASE}. ${ettNotes.trim()}`
        : ETT_QUICK_PHRASE
    }
    await saveClinical({ ett_notes: next })
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-slate-800">Statut Clinique</h2>

      <div className={cardCls}>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-slate-700">Âge</span>
          <input
            type="number"
            defaultValue={(c.age as number) ?? ""}
            onBlur={e => saveClinical({ age: Number(e.target.value) || null })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white w-24"
          />
        </label>
      </div>

      <div className={cardCls}>
        <p className="text-sm font-semibold text-slate-700 mb-3">Facteurs de risque cardiovasculaire</p>
        <div className="grid grid-cols-2 gap-y-2 gap-x-6 mb-4">
          {options.fdrcx.map(item => (
            <label key={item} className="flex items-center gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={fdrcxList.includes(item)}
                onChange={() => toggleFdrcx(item)}
                className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
              />
              <span className="text-slate-700">{item}</span>
            </label>
          ))}
        </div>
        <textarea
          rows={2}
          placeholder="Précisions (dosages, HbA1c…)"
          defaultValue={(c.fdrcx_notes as string) || ""}
          onBlur={e => saveClinical({ fdrcx_notes: e.target.value })}
          className={inputCls}
        />
      </div>

      {([
        ["atcd", "Antécédents", 3],
        ["hm", "Histoire de la maladie", 4],
        ["ecg", "ECG", 3],
      ] as const).map(([field, label, rows]) => (
        <div key={field} className={cardCls}>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700">{label}</span>
            <textarea
              rows={rows}
              defaultValue={(c[field] as string) || ""}
              onBlur={e => saveClinical({ [field]: e.target.value })}
              className={inputCls}
              placeholder={`Saisir ${label.toLowerCase()}…`}
            />
          </label>
        </div>
      ))}

      {/* ETT description with quick phrase */}
      <div className={cardCls}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">ETT (description)</span>
          <label className="flex items-center gap-2 text-xs cursor-pointer text-slate-700">
            <input
              type="checkbox"
              checked={hasQuickPhrase}
              onChange={toggleQuickPhrase}
              className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
            />
            « {ETT_QUICK_PHRASE} »
          </label>
        </div>
        <textarea
          key={ettNotes /* re-mount on programmatic change */}
          rows={3}
          defaultValue={ettNotes}
          onBlur={e => saveClinical({ ett_notes: e.target.value })}
          className={inputCls}
          placeholder="Saisir l'ETT…"
        />
      </div>

      {/* Troubles de la cinétique */}
      <div className={cardCls}>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">Troubles de la cinétique</span>
          <textarea
            rows={2}
            defaultValue={(c.ett_kinetics as string) || ""}
            onBlur={e => saveClinical({ ett_kinetics: e.target.value })}
            className={inputCls}
            placeholder="Ex: hypokinésie inféro-basale, akinésie apicale…"
          />
        </label>
      </div>

      <div className={cardCls}>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-slate-700">FEVG (%)</span>
          <input
            type="number"
            defaultValue={(c.ett_fevg as number) ?? ""}
            onBlur={e => saveClinical({ ett_fevg: Number(e.target.value) || null })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white w-24"
          />
        </label>
      </div>
    </div>
  )
}
