import { useState } from "react"
import type { FullReport, Options, Doctor } from "../../types"
import LesionRow from "./LesionRow"

interface Props {
  full: FullReport; setFull: (f: FullReport) => void
  options: Options; doctors: Doctor[]; reportId: number
}

const DOMINANCE_OPTIONS = ["Droite", "Gauche", "Équilibrée"]

export default function CoroTab({ full, setFull, reportId }: Props) {
  const [dominance, setDominance] = useState("Droite")
  const [nDiag, setNDiag] = useState(1)
  const [nMarg, setNMarg] = useState(1)
  const [calcified, setCalcified] = useState(false)
  const [infiltrated, setInfiltrated] = useState(false)

  const rowProps = { reportId, full, setFull }

  const selectCls = "border border-slate-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
  const checkboxCls = "w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"

  return (
    <div className="space-y-5 max-w-2xl">
      <h2 className="text-lg font-semibold text-slate-800">Coronarographie</h2>

      {/* Dominance */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-700 mb-3">Dominance</p>
        <div className="flex gap-6">
          {DOMINANCE_OPTIONS.map(d => (
            <label key={d} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="dominance"
                value={d}
                checked={dominance === d}
                onChange={() => setDominance(d)}
                className="w-4 h-4 border-slate-300 text-blue-700 focus:ring-blue-600"
              />
              <span className="text-slate-700">{d}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Artère Coronaire Gauche */}
      <div className="rounded-xl border border-blue-200 overflow-hidden">
        <div className="bg-blue-700 px-5 py-3">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            Artère Coronaire Gauche
          </h3>
        </div>
        <div className="bg-blue-50 p-4 space-y-4">
          {/* TCG */}
          <div>
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Tronc Commun Gauche</p>
            <LesionRow {...rowProps} artery="TCG" label="TCG" />
          </div>

          {/* IVA */}
          <div>
            <div className="flex items-center flex-wrap gap-4 mb-2">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">IVA</p>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={calcified} onChange={e => setCalcified(e.target.checked)} className={checkboxCls} />
                <span className="text-slate-600">Calcifiée</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={infiltrated} onChange={e => setInfiltrated(e.target.checked)} className={checkboxCls} />
                <span className="text-slate-600">Infiltrée</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <span className="text-slate-600">Diagonales :</span>
                <select value={nDiag} onChange={e => setNDiag(Number(e.target.value))} className={selectCls}>
                  {[0, 1, 2, 3].map(n => <option key={n}>{n}</option>)}
                </select>
              </label>
            </div>
            <LesionRow {...rowProps} artery="IVA_prox" label="IVA proximale" />
            <LesionRow {...rowProps} artery="IVA_moy" label="IVA moyenne" />
            <LesionRow {...rowProps} artery="IVA_dist" label="IVA distale" />
          </div>

          {/* Circonflexe */}
          <div>
            <div className="flex items-center gap-4 mb-2">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Circonflexe</p>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <span className="text-slate-600">Marginales :</span>
                <select value={nMarg} onChange={e => setNMarg(Number(e.target.value))} className={selectCls}>
                  {[0, 1, 2, 3].map(n => <option key={n}>{n}</option>)}
                </select>
              </label>
            </div>
            <LesionRow {...rowProps} artery="CX_prox" label="CX proximale" />
            <LesionRow {...rowProps} artery="CX_dist" label="CX distale" />
            <LesionRow {...rowProps} artery="M1_prox" label="M1 proximale" />
            <LesionRow {...rowProps} artery="M1_dist" label="M1 distale" />
            <LesionRow {...rowProps} artery="M2" label="M2" />
          </div>
        </div>
      </div>

      {/* Artère Coronaire Droite */}
      <div className="rounded-xl border border-red-200 overflow-hidden">
        <div className="bg-red-700 px-5 py-3">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            Artère Coronaire Droite
          </h3>
        </div>
        <div className="bg-red-50 p-4">
          <LesionRow {...rowProps} artery="CD1" label="CD1 (genou sup.)" />
          <LesionRow {...rowProps} artery="CD2" label="CD2 (genou inf.)" />
          <LesionRow {...rowProps} artery="CD3" label="CD distale" />
          <LesionRow {...rowProps} artery="IVP" label="IVP" />
          <LesionRow {...rowProps} artery="RVP" label="RVP" />
        </div>
      </div>
    </div>
  )
}
