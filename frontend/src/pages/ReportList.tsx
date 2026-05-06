import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api/reports"
import type { Report } from "../types"

function TypeBadge({ type }: { type: string }) {
  if (type === "atc")
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">ATC</span>
  if (type === "coro+atc")
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Coro + ATC</span>
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Coro</span>
}

export default function ReportList() {
  const [reports, setReports] = useState<Report[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const nav = useNavigate()

  useEffect(() => { api.listReports().then(setReports) }, [])

  async function createWithType(type: string) {
    setShowCreate(false)
    const r = await api.createReport({ type, exam_date: new Date().toISOString().split("T")[0] })
    nav(`/reports/${r.id}`)
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer ce compte rendu ?")) return
    await api.deleteReport(id)
    setReports(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Comptes Rendus</h1>
          <p className="text-slate-500 text-sm mt-1">
            {reports.length} compte{reports.length !== 1 ? "s" : ""} rendu{reports.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowCreate(s => !s)}
            className="inline-flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau CR
          </button>
          {showCreate && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 z-10 overflow-hidden">
              <button onClick={() => createWithType("coro")}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100">
                <div className="font-medium text-sm text-slate-900">Coronarographie</div>
                <div className="text-xs text-slate-500">CR diagnostique seul</div>
              </button>
              <button onClick={() => createWithType("coro+atc")}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100">
                <div className="font-medium text-sm text-slate-900">Coro + Angioplastie</div>
                <div className="text-xs text-slate-500">Diagnostique + intervention</div>
              </button>
              <button onClick={() => createWithType("atc")}
                className="w-full text-left px-4 py-3 hover:bg-slate-50">
                <div className="font-medium text-sm text-slate-900">Angioplastie seule</div>
                <div className="text-xs text-slate-500">Intervention (contrôle, ATL différée…)</div>
              </button>
            </div>
          )}
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-500 font-medium">Aucun compte rendu</p>
          <p className="text-slate-400 text-sm mt-1">Créez votre premier CR en cliquant sur "Nouveau CR"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map(r => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => nav(`/reports/${r.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <TypeBadge type={r.type} />
                <span className="text-xs text-slate-400">{r.exam_date || "—"}</span>
              </div>
              <h3 className="font-semibold text-slate-900 text-base mb-1 group-hover:text-blue-700 transition-colors">
                {r.patient_name || <span className="text-slate-400 font-normal italic">Patient non renseigné</span>}
              </h3>
              <p className="text-sm text-slate-500 mb-4">IPP : {r.ipp || "—"}</p>
              <div className="flex gap-3 border-t border-slate-100 pt-3">
                <button
                  onClick={e => { e.stopPropagation(); nav(`/reports/${r.id}`) }}
                  className="text-blue-700 hover:text-blue-900 text-sm font-medium transition-colors"
                >
                  Ouvrir
                </button>
                <button
                  onClick={e => { e.stopPropagation(); api.exportDocx(r.id) }}
                  className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
                >
                  Export .docx
                </button>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(r.id) }}
                  className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors ml-auto"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
