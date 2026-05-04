import type { FullReport, Options, Doctor } from "../../types"
interface Props { full: FullReport; setFull: (f: FullReport) => void; options: Options; doctors: Doctor[]; reportId: number }
export default function ConclusionTab(_: Props) { return <div className="p-4 text-gray-400">Conclusion — à implémenter</div> }
