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
  ett_fevg?: number; ett_notes: string
}

export interface Technique {
  id: number; report_id: number; room: string; approach: string
  french_size: number; contrast_cc?: number; dose_mgy?: number; material: string
}

export interface Lesion {
  id: number; report_id: number; artery: string; stenosis_pct: string
  timi: number; good_distal_bed: boolean; notes: string; position: number
}

export interface Conclusion {
  id: number; report_id: number; trunk_disease: string
  decision: string; decision_notes: string
}

export interface FullReport {
  report: Report
  clinical?: ClinicalStatus
  technique?: Technique
  lesions: Lesion[]
  conclusion?: Conclusion
}

export interface Options {
  rooms: string[]; approaches: string[]; french_sizes: number[]
  material: string[]; indications: string[]; fdrcx: string[]
  ecg_findings: string[]; decisions: string[]
}
