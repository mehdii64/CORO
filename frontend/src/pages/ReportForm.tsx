import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { api } from "../api/reports"
import type { FullReport, Options, Doctor } from "../types"
import HeaderTab from "../components/form/HeaderTab"
import IndicationsTab from "../components/form/IndicationsTab"
import ClinicalTab from "../components/form/ClinicalTab"
import TechniqueTab from "../components/form/TechniqueTab"
import CoroTab from "../components/form/CoroTab"
import ConclusionTab from "../components/form/ConclusionTab"
import PreviewPanel from "../components/PreviewPanel"

const TABS = ["En-tête", "Indications", "Statut clinique", "Technique", "Coronarographie", "Conclusion"]

export default function ReportForm() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const [tab, setTab] = useState(0)
  const [full, setFull] = useState<FullReport | null>(null)
  const [options, setOptions] = useState<Options | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])

  useEffect(() => {
    if (!id) return
    api.getReport(Number(id)).then(setFull)
    api.getOptions().then(setOptions)
    api.getDoctors().then(setDoctors)
  }, [id])

  if (!full || !options) return <div className="p-8 text-gray-400">Chargement...</div>

  const tabProps = { full, setFull, options, doctors, reportId: Number(id) }

  return (
    <div className="flex h-screen">
      <aside className="w-44 bg-gray-50 border-r flex flex-col pt-4 shrink-0">
        <button onClick={() => nav("/")} className="text-sm text-blue-600 hover:underline px-4 mb-4">← Retour</button>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`text-left px-4 py-3 text-sm border-l-4 ${tab === i ? "border-blue-600 bg-white font-semibold" : "border-transparent hover:bg-gray-100"}`}>
            {t}
          </button>
        ))}
        <div className="mt-auto p-3">
          <button onClick={() => api.exportDocx(Number(id))}
            className="w-full bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700">
            Exporter .docx
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        {tab === 0 && <HeaderTab {...tabProps} />}
        {tab === 1 && <IndicationsTab {...tabProps} />}
        {tab === 2 && <ClinicalTab {...tabProps} />}
        {tab === 3 && <TechniqueTab {...tabProps} />}
        {tab === 4 && <CoroTab {...tabProps} />}
        {tab === 5 && <ConclusionTab {...tabProps} />}
      </main>

      <PreviewPanel full={full} />
    </div>
  )
}
