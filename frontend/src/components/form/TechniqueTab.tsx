import type { FullReport, Options, Doctor } from "../../types"
interface Props { full: FullReport; setFull: (f: FullReport) => void; options: Options; doctors: Doctor[]; reportId: number }
export default function TechniqueTab(_: Props) { return <div className="p-4 text-gray-400">Technique — à implémenter</div> }
