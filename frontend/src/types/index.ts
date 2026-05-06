export interface Doctor { id: number; name: string; active: boolean }

export interface Report {
  id: number; type: string; patient_name: string; dob: string
  sex: string; ipp: string; height?: number; weight?: number
  exam_date: string; operators: string; indication: string
  created_at: string; updated_at: string
}

export interface ClinicalStatus {
  id: number; report_id: number; age?: number; fdrcx: string
  fdrcx_notes: string; atcd: string; hm: string; ecg: string
  ett_fevg?: number; ett_notes: string; ett_kinetics: string
}

export interface Technique {
  id: number; report_id: number; room: string; approach: string
  french_size: number; contrast_cc?: number; dose_mgy?: number; material: string
}

export interface Lesion {
  id: number; report_id: number; artery: string; stenosis_pct: string
  timi: number; good_distal_bed: boolean; notes: string; position: number
  occlusion_type: string  // "" | "aigue" | "chronique"
}

export interface Conclusion {
  id: number; report_id: number; trunk_disease: string
  decision: string; decision_notes: string
}

export interface StentSpec {
  name: string         // brand name e.g. "XIENCE ALPINE"
  manufacturer: string // e.g. "Abbott"
  type: string         // "actif" | "nu" | "résorbable"
  diameter: string     // e.g. "2.75"
  length: string       // e.g. "38"
  pressure: string     // e.g. "10 ATM x 30 sec"
}

export interface Intervention {
  id: number
  report_id: number
  position: number
  artery: string
  lesion_summary: string
  guide_catheter: string
  wires: string                  // JSON array of strings
  predilation: boolean
  predilation_balloon: string
  predilation_pressure: string
  stents: string                 // JSON array of StentSpec
  postdilation: boolean
  postdilation_balloon: string
  postdilation_pressure: string
  final_timi: number
  success: boolean
  complications: string
  notes: string
}

export interface FullReport {
  report: Report
  clinical?: ClinicalStatus
  technique?: Technique
  lesions: Lesion[]
  conclusion?: Conclusion
  interventions: Intervention[]
}

export interface Options {
  rooms: string[]; approaches: string[]; french_sizes: number[]
  material: string[]; indications: string[]; fdrcx: string[]
  ecg_findings: string[]; decisions: string[]
  default_material?: string[]
  balloon_pressures?: string[]
  guide_catheters?: string[]
  wires_014?: string[]
  balloons_sc?: string[]
  balloons_nc?: string[]
  stent_brands?: string[]
  stent_types?: string[]
  stent_diameters?: number[]
  stent_lengths?: number[]
  target_arteries_atc?: string[]
}
