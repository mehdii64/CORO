import { useState } from "react"
import type { FullReport, Options, Doctor } from "../../types"
import LesionRow from "./LesionRow"

interface Props {
  full: FullReport
  setFull: (f: FullReport) => void
  options: Options
  doctors: Doctor[]
  reportId: number
}

const DOMINANCE_OPTIONS = ["Droite", "Gauche", "Équilibrée"]

export default function CoroTab({ full, setFull, reportId }: Props) {
  const [dominance, setDominance] = useState("Droite")
  const [nDiag, setNDiag] = useState(1)
  const [nMarg, setNMarg] = useState(1)
  const [calcified, setCalcified] = useState(false)
  const [infiltrated, setInfiltrated] = useState(false)

  const rowProps = { reportId, full, setFull }
  const isLeftDominant = dominance === "Gauche"

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-lg font-semibold">Coronarographie</h2>

      {/* Dominance */}
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">Dominance</p>
        <div className="flex gap-4">
          {DOMINANCE_OPTIONS.map(d => (
            <label key={d} className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="dominance"
                value={d}
                checked={dominance === d}
                onChange={() => setDominance(d)}
              />
              {d}
            </label>
          ))}
        </div>
      </div>

      {/* Artère Coronaire Gauche */}
      <section>
        <h3 className="font-semibold text-blue-700 mb-2">Artère Coronaire Gauche</h3>

        <div className="mb-3 pl-2">
          <p className="text-sm font-medium text-gray-700 mb-1">Tronc Commun Gauche</p>
          <LesionRow {...rowProps} artery="TCG" label="TCG" />
        </div>

        <div className="mb-3 pl-2">
          <div className="flex items-center gap-4 mb-1">
            <p className="text-sm font-medium text-gray-700">IVA</p>
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={calcified} onChange={e => setCalcified(e.target.checked)} />
              Calcifiée
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={infiltrated} onChange={e => setInfiltrated(e.target.checked)} />
              Infiltrée
            </label>
            <label className="flex items-center gap-1 text-sm">
              Diagonales :
              <select
                value={nDiag}
                onChange={e => setNDiag(Number(e.target.value))}
                className="border rounded px-1 ml-1 text-sm"
              >
                {[0, 1, 2, 3].map(n => <option key={n}>{n}</option>)}
              </select>
            </label>
          </div>
          <LesionRow {...rowProps} artery="IVA_prox" label="IVA proximale" />
          <LesionRow {...rowProps} artery="IVA_moy"  label="IVA moyenne" />
          <LesionRow {...rowProps} artery="IVA_dist" label="IVA distale" />
        </div>

        <div className="pl-2">
          <div className="flex items-center gap-4 mb-1">
            <p className="text-sm font-medium text-gray-700">Circonflexe</p>
            <label className="flex items-center gap-1 text-sm">
              Marginales :
              <select
                value={nMarg}
                onChange={e => setNMarg(Number(e.target.value))}
                className="border rounded px-1 ml-1 text-sm"
              >
                {[0, 1, 2, 3].map(n => <option key={n}>{n}</option>)}
              </select>
            </label>
          </div>
          <LesionRow {...rowProps} artery="CX_prox"  label="CX proximale" />
          <LesionRow {...rowProps} artery="CX_dist"  label="CX distale" />
          <LesionRow {...rowProps} artery="M1_prox"  label="M1 proximale" />
          <LesionRow {...rowProps} artery="M1_dist"  label="M1 distale" />
          <LesionRow {...rowProps} artery="M2"       label="M2" />
        </div>
      </section>

      {/* Artère Coronaire Droite */}
      <section>
        <h3 className="font-semibold text-red-700 mb-2">Artère Coronaire Droite</h3>
        <div className="pl-2">
          <LesionRow {...rowProps} artery="CD1" label="CD1 (genou sup.)" />
          <LesionRow {...rowProps} artery="CD2" label="CD2 (genou inf.)" />
          <LesionRow {...rowProps} artery="CD3" label="CD distale" />
          <div className={isLeftDominant ? "opacity-40 pointer-events-none" : ""}>
            <LesionRow {...rowProps} artery="IVP" label="IVP" />
            <LesionRow {...rowProps} artery="RVP" label="RVP" />
          </div>
          {isLeftDominant && (
            <p className="text-xs text-gray-400 mt-1">IVP/RVP non disponibles (dominance gauche)</p>
          )}
        </div>
      </section>
    </div>
  )
}
