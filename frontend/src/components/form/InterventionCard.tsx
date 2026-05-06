import { useState } from "react"
import { api } from "../../api/reports"
import type { FullReport, Intervention, Options, StentSpec } from "../../types"
import BalloonInput from "./BalloonInput"

interface Props {
  reportId: number
  full: FullReport
  setFull: (f: FullReport) => void
  options: Options
  intervention: Intervention
}

function parseList<T = string>(raw: string): T[] {
  try { return JSON.parse(raw || "[]") } catch { return [] }
}

const EMPTY_STENT: StentSpec = {
  name: "", manufacturer: "", type: "actif",
  diameter: "", length: "", pressure: "8 ATM x 20 sec",
}

export default function InterventionCard({ reportId, full, setFull, options, intervention }: Props) {
  const [open, setOpen] = useState(true)

  const wires = parseList<string>(intervention.wires)
  const stents = parseList<StentSpec>(intervention.stents)

  async function patch(updates: Partial<Intervention>) {
    const next = { ...intervention, ...updates }
    const updated = await api.updateIntervention(reportId, intervention.id, next)
    setFull({
      ...full,
      interventions: full.interventions.map(i => i.id === intervention.id ? updated : i),
    })
  }

  async function remove() {
    if (!confirm("Supprimer cette intervention ?")) return
    await api.deleteIntervention(reportId, intervention.id)
    setFull({
      ...full,
      interventions: full.interventions.filter(i => i.id !== intervention.id),
    })
  }

  function setWires(next: string[]) {
    patch({ wires: JSON.stringify(next) })
  }
  function setStents(next: StentSpec[]) {
    patch({ stents: JSON.stringify(next) })
  }

  function toggleWire(w: string) {
    if (wires.includes(w)) setWires(wires.filter(x => x !== w))
    else setWires([...wires, w])
  }

  function addStent() {
    setStents([...stents, { ...EMPTY_STENT }])
  }
  function updateStent(idx: number, patch: Partial<StentSpec>) {
    setStents(stents.map((s, i) => i === idx ? { ...s, ...patch } : s))
  }
  function removeStent(idx: number) {
    setStents(stents.filter((_, i) => i !== idx))
  }

  const arteries = options.target_arteries_atc ?? []
  const guides = options.guide_catheters ?? []
  const wireOpts = options.wires_014 ?? []
  const balloonsSc = options.balloons_sc ?? []
  const balloonsNc = options.balloons_nc ?? []
  const stentBrands = options.stent_brands ?? []
  const stentTypes = options.stent_types ?? ["actif", "nu", "résorbable"]
  const stentDiameters = options.stent_diameters ?? []
  const stentLengths = options.stent_lengths ?? []

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b rounded-t-lg">
        <button onClick={() => setOpen(!open)} className="flex-1 text-left font-semibold text-sm">
          {open ? "▾" : "▸"} Intervention #{intervention.position + 1} — {intervention.artery || "(artère ?)"}
        </button>
        <button onClick={remove} className="text-red-500 text-xs hover:underline">Supprimer</button>
      </div>

      {open && (
        <div className="p-4 space-y-4 text-sm">
          {/* Artery + summary */}
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col">
              <span className="text-xs text-gray-600 mb-0.5">Artère traitée</span>
              <input
                list="atc-arteries"
                value={intervention.artery}
                onChange={e => patch({ artery: e.target.value })}
                className="border rounded px-2 py-1 w-56"
                placeholder="Ex: CD II"
              />
              <datalist id="atc-arteries">
                {arteries.map(a => <option key={a} value={a} />)}
              </datalist>
            </label>
            <label className="flex flex-col flex-1 min-w-60">
              <span className="text-xs text-gray-600 mb-0.5">Description lésion (optionnel)</span>
              <input
                value={intervention.lesion_summary}
                onChange={e => patch({ lesion_summary: e.target.value })}
                className="border rounded px-2 py-1"
                placeholder="Ex: subocclusive 99% MEDINA 1-1-1"
              />
            </label>
          </div>

          {/* Guide catheter */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1">Cathéter guide</p>
            <input
              list="atc-guides"
              value={intervention.guide_catheter}
              onChange={e => patch({ guide_catheter: e.target.value })}
              className="border rounded px-2 py-1 w-full"
              placeholder="Ex: JR 4 6F (Medtronic)"
            />
            <datalist id="atc-guides">
              {guides.map(g => <option key={g} value={g} />)}
            </datalist>
          </div>

          {/* Wires */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1">Guides 0.014 utilisés</p>
            <div className="flex flex-wrap gap-1.5">
              {wireOpts.map(w => (
                <label key={w} className={`text-xs px-2 py-1 border rounded cursor-pointer ${wires.includes(w) ? "bg-blue-100 border-blue-400" : "hover:bg-gray-50"}`}>
                  <input type="checkbox" className="mr-1" checked={wires.includes(w)} onChange={() => toggleWire(w)} />
                  {w}
                </label>
              ))}
            </div>
            {wires.length > 1 && (
              <p className="text-xs text-gray-500 mt-1">{wires.length} guides sélectionnés (bifurcation / branches)</p>
            )}
          </div>

          {/* Pre-dilatation */}
          <div className="border-t pt-3">
            <label className="flex items-center gap-2 font-semibold text-sm">
              <input type="checkbox" checked={intervention.predilation} onChange={e => patch({ predilation: e.target.checked })} />
              Pré-dilatation
            </label>
            {intervention.predilation && (
              <div className="mt-2 flex flex-wrap gap-3 pl-6">
                <BalloonInput
                  label="Ballon SC"
                  value={intervention.predilation_balloon}
                  onChange={v => patch({ predilation_balloon: v })}
                  listId="atc-balloons-sc"
                  options={balloonsSc}
                  defaultKind="SC"
                />
                <label className="flex flex-col w-44">
                  <span className="text-xs text-gray-600 mb-0.5">Pression / durée</span>
                  <input
                    list="atc-balloon-pressures"
                    value={intervention.predilation_pressure || "8 ATM x 20 sec"}
                    onChange={e => patch({ predilation_pressure: e.target.value })}
                    className="border rounded px-2 py-1"
                    placeholder="Ex: 8 ATM x 20 sec"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Stents */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-sm">Stents</p>
              <button onClick={addStent} className="text-blue-600 text-xs hover:underline">+ Ajouter un stent</button>
            </div>
            {stents.length === 0 && <p className="text-xs text-gray-400">Aucun stent (cliquer + Ajouter)</p>}
            {stents.map((s, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-end">
                <label className="col-span-4 flex flex-col">
                  <span className="text-[10px] text-gray-500">Marque/Modèle</span>
                  <input
                    list="atc-stent-brands"
                    value={s.name}
                    onChange={e => updateStent(idx, { name: e.target.value })}
                    className="border rounded px-2 py-1 text-xs"
                    placeholder="XIENCE ALPINE"
                  />
                </label>
                <label className="col-span-2 flex flex-col">
                  <span className="text-[10px] text-gray-500">Type</span>
                  <select value={s.type} onChange={e => updateStent(idx, { type: e.target.value })} className="border rounded px-1 py-1 text-xs">
                    {stentTypes.map(t => <option key={t}>{t}</option>)}
                  </select>
                </label>
                <label className="col-span-1 flex flex-col">
                  <span className="text-[10px] text-gray-500">Ø mm</span>
                  <input
                    list="atc-stent-d"
                    value={s.diameter}
                    onChange={e => updateStent(idx, { diameter: e.target.value })}
                    className="border rounded px-1 py-1 text-xs"
                    placeholder="3.0"
                  />
                </label>
                <label className="col-span-1 flex flex-col">
                  <span className="text-[10px] text-gray-500">L mm</span>
                  <input
                    list="atc-stent-l"
                    value={s.length}
                    onChange={e => updateStent(idx, { length: e.target.value })}
                    className="border rounded px-1 py-1 text-xs"
                    placeholder="28"
                  />
                </label>
                <label className="col-span-3 flex flex-col">
                  <span className="text-[10px] text-gray-500">Pression / durée</span>
                  <input
                    list="atc-balloon-pressures"
                    value={s.pressure}
                    onChange={e => updateStent(idx, { pressure: e.target.value })}
                    className="border rounded px-2 py-1 text-xs"
                    placeholder="8 ATM x 20 sec"
                  />
                </label>
                <button onClick={() => removeStent(idx)} className="col-span-1 text-red-500 text-xs hover:underline">×</button>
              </div>
            ))}
            <datalist id="atc-stent-brands">
              {stentBrands.map(b => <option key={b} value={b} />)}
            </datalist>
            <datalist id="atc-stent-d">
              {stentDiameters.map(d => <option key={d} value={d} />)}
            </datalist>
            <datalist id="atc-stent-l">
              {stentLengths.map(l => <option key={l} value={l} />)}
            </datalist>
            <datalist id="atc-balloon-pressures">
              {(options.balloon_pressures ?? ["8 ATM x 20 sec", "10 ATM x 20 sec", "12 ATM x 20 sec", "14 ATM x 20 sec", "16 ATM x 20 sec"]).map(p => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          {/* Post-dilatation */}
          <div className="border-t pt-3">
            <label className="flex items-center gap-2 font-semibold text-sm">
              <input type="checkbox" checked={intervention.postdilation} onChange={e => patch({ postdilation: e.target.checked })} />
              Post-dilatation
            </label>
            {intervention.postdilation && (
              <div className="mt-2 flex flex-wrap gap-3 pl-6">
                <BalloonInput
                  label="Ballon NC"
                  value={intervention.postdilation_balloon}
                  onChange={v => patch({ postdilation_balloon: v })}
                  listId="atc-balloons-nc"
                  options={balloonsNc}
                  defaultKind="NC"
                />
                <label className="flex flex-col w-44">
                  <span className="text-xs text-gray-600 mb-0.5">Pression / durée</span>
                  <input
                    list="atc-balloon-pressures"
                    value={intervention.postdilation_pressure || "8 ATM x 20 sec"}
                    onChange={e => patch({ postdilation_pressure: e.target.value })}
                    className="border rounded px-2 py-1"
                    placeholder="Ex: 8 ATM x 20 sec"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Result */}
          <div className="border-t pt-3 flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-1">
              <span className="text-xs">TIMI final</span>
              <select value={intervention.final_timi} onChange={e => patch({ final_timi: Number(e.target.value) })} className="border rounded px-1 py-0.5 text-sm">
                {[0, 1, 2, 3].map(n => <option key={n}>{n}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={intervention.success} onChange={e => patch({ success: e.target.checked })} />
              Procédure réussie
            </label>
            <label className="flex flex-col flex-1 min-w-60">
              <span className="text-xs text-gray-600">Complications</span>
              <input
                value={intervention.complications}
                onChange={e => patch({ complications: e.target.value })}
                className="border rounded px-2 py-1"
                placeholder="Ex: no reflow, dissection..."
              />
            </label>
          </div>

          <div>
            <span className="text-xs text-gray-600">Note libre (ajoutée à la narration)</span>
            <textarea
              value={intervention.notes}
              onChange={e => patch({ notes: e.target.value })}
              className="border rounded px-2 py-1 w-full text-xs"
              rows={2}
              placeholder="Ex: Dottering préalable, geste sur bifurcation, etc."
            />
          </div>
        </div>
      )}
    </div>
  )
}
