import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api/reports"
import type { Report } from "../types"

export default function ReportList() {
  const [reports, setReports] = useState<Report[]>([])
  const nav = useNavigate()

  useEffect(() => { api.listReports().then(setReports) }, [])

  async function handleNew() {
    const r = await api.createReport({ type: "coro", exam_date: new Date().toISOString().split("T")[0] })
    nav(`/reports/${r.id}`)
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer ce compte rendu ?")) return
    await api.deleteReport(id)
    setReports(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Comptes Rendus Coronarographie</h1>
        <div className="flex gap-2">
          <button onClick={handleNew}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Nouveau CR
          </button>
          <button onClick={() => nav("/settings")}
            className="border px-4 py-2 rounded hover:bg-gray-50">
            Configuration
          </button>
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Patient</th>
            <th className="p-2 border">IPP</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="p-2 border">{r.exam_date}</td>
              <td className="p-2 border font-medium">{r.patient_name || "—"}</td>
              <td className="p-2 border text-gray-500">{r.ipp || "—"}</td>
              <td className="p-2 border uppercase text-xs">{r.type}</td>
              <td className="p-2 border">
                <div className="flex gap-1">
                  <button onClick={() => nav(`/reports/${r.id}`)}
                    className="text-blue-600 hover:underline text-sm">Ouvrir</button>
                  <button onClick={() => api.exportDocx(r.id)}
                    className="text-green-600 hover:underline text-sm">Export .docx</button>
                  <button onClick={() => handleDelete(r.id)}
                    className="text-red-500 hover:underline text-sm">Supprimer</button>
                </div>
              </td>
            </tr>
          ))}
          {reports.length === 0 && (
            <tr><td colSpan={5} className="p-4 text-center text-gray-400">Aucun compte rendu</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
