import { useEffect, useState, type ReactNode } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { api } from "../api/reports"
import type { FullReport, Options, Doctor } from "../types"
import HeaderTab from "../components/form/HeaderTab"
import IndicationsTab from "../components/form/IndicationsTab"
import ClinicalTab from "../components/form/ClinicalTab"
import TechniqueTab from "../components/form/TechniqueTab"
import CoroTab from "../components/form/CoroTab"
import ATCTab from "../components/form/ATCTab"
import ConclusionTab from "../components/form/ConclusionTab"
import PreviewPanel from "../components/PreviewPanel"

type TabKey = "header" | "indications" | "clinical" | "technique" | "coro" | "atc" | "conclusion"

const ICONS: Record<TabKey, ReactNode> = {
  header: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  indications: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  clinical: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  technique: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  coro: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  atc: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  conclusion: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const LABELS: Record<TabKey, string> = {
  header: "En-tête",
  indications: "Indications",
  clinical: "Statut clinique",
  technique: "Technique",
  coro: "Coronaro-graphie",
  atc: "Angioplastie",
  conclusion: "Conclusion",
}

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

  if (!full || !options) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Chargement…</p>
        </div>
      </div>
    )
  }

  const reportType = full.report.type || "coro"
  const hasCoro = reportType === "coro" || reportType === "coro+atc"
  const hasAtc = reportType === "atc" || reportType === "coro+atc"

  const tabKeys: TabKey[] = ["header", "indications", "clinical", "technique"]
  if (hasCoro) tabKeys.push("coro")
  if (hasAtc) tabKeys.push("atc")
  tabKeys.push("conclusion")

  const safeTab = Math.min(tab, tabKeys.length - 1)
  const activeKey = tabKeys[safeTab]
  const tabProps = { full, setFull, options, doctors, reportId: Number(id) }

  async function changeType(newType: string) {
    const updated = await api.updateReport(Number(id), { ...full!.report, type: newType })
    setFull({ ...full!, report: updated })
    setTab(0)
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <aside className="w-52 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm">
        <div className="px-3 pt-3 pb-2 border-b border-slate-100">
          <label className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">Type de CR</label>
          <select
            value={reportType}
            onChange={e => changeType(e.target.value)}
            className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-xs mt-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="coro">Coronarographie</option>
            <option value="coro+atc">Coro + Angioplastie</option>
            <option value="atc">Angioplastie seule</option>
          </select>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {tabKeys.map((key, i) => (
            <button
              key={key}
              onClick={() => setTab(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                safeTab === i
                  ? "bg-blue-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className={`shrink-0 ${safeTab === i ? "text-white" : "text-slate-400"}`}>
                {ICONS[key]}
              </span>
              <span className="flex-1 leading-tight">{LABELS[key]}</span>
              <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0 ${
                safeTab === i ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {i + 1}
              </span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={() => api.exportDocx(Number(id))}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exporter .docx
          </button>
          <button
            onClick={() => nav("/")}
            className="w-full mt-2 text-slate-500 hover:text-slate-700 text-sm py-1 transition-colors"
          >
            ← Retour à la liste
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <div className="max-w-3xl">
          {activeKey === "header" && <HeaderTab {...tabProps} />}
          {activeKey === "indications" && <IndicationsTab {...tabProps} />}
          {activeKey === "clinical" && <ClinicalTab {...tabProps} />}
          {activeKey === "technique" && <TechniqueTab {...tabProps} />}
          {activeKey === "coro" && <CoroTab {...tabProps} />}
          {activeKey === "atc" && <ATCTab {...tabProps} />}
          {activeKey === "conclusion" && <ConclusionTab {...tabProps} />}
        </div>
      </main>

      <PreviewPanel full={full} />
    </div>
  )
}
