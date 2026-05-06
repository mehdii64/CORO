import { api } from "../../api/reports"
import type { FullReport, Options, Doctor } from "../../types"
import InterventionCard from "./InterventionCard"

interface Props {
  full: FullReport
  setFull: (f: FullReport) => void
  options: Options
  doctors: Doctor[]
  reportId: number
}

export default function ATCTab({ full, setFull, options, reportId }: Props) {
  const interventions = full.interventions ?? []

  async function addIntervention() {
    const iv = await api.addIntervention(reportId, {
      artery: "",
      lesion_summary: "",
      guide_catheter: "",
      wires: "[]",
      predilation: false,
      predilation_balloon: "",
      predilation_pressure: "",
      stents: "[]",
      postdilation: false,
      postdilation_balloon: "",
      postdilation_pressure: "",
      final_timi: 3,
      success: true,
      complications: "",
      notes: "",
      position: interventions.length,
    })
    setFull({ ...full, interventions: [...interventions, iv] })
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Angioplastie (ATC)</h2>
        <button onClick={addIntervention} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
          + Ajouter une intervention
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Une intervention par artère traitée. Chaque carte génère automatiquement la narration et la liste de matériel ATC.
      </p>

      {interventions.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400 text-sm">
          Aucune intervention. Cliquer « + Ajouter une intervention » pour commencer.
        </div>
      )}

      {interventions.map(iv => (
        <InterventionCard
          key={iv.id}
          reportId={reportId}
          full={full}
          setFull={setFull}
          options={options}
          intervention={iv}
        />
      ))}
    </div>
  )
}
