const BASE = "http://localhost:8000/api"

export const api = {
  listReports: () => fetch(`${BASE}/reports`).then(r => r.json()),
  createReport: (data: object) =>
    fetch(`${BASE}/reports`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  getReport: (id: number) => fetch(`${BASE}/reports/${id}`).then(r => r.json()),
  updateReport: (id: number, data: object) =>
    fetch(`${BASE}/reports/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  updateClinical: (id: number, data: object) =>
    fetch(`${BASE}/reports/${id}/clinical`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  updateTechnique: (id: number, data: object) =>
    fetch(`${BASE}/reports/${id}/technique`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  updateConclusion: (id: number, data: object) =>
    fetch(`${BASE}/reports/${id}/conclusion`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  addLesion: (id: number, data: object) =>
    fetch(`${BASE}/reports/${id}/lesions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  updateLesion: (rid: number, lid: number, data: object) =>
    fetch(`${BASE}/reports/${rid}/lesions/${lid}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  deleteLesion: (rid: number, lid: number) =>
    fetch(`${BASE}/reports/${rid}/lesions/${lid}`, { method: "DELETE" }),
  addIntervention: (id: number, data: object) =>
    fetch(`${BASE}/reports/${id}/interventions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  updateIntervention: (rid: number, iid: number, data: object) =>
    fetch(`${BASE}/reports/${rid}/interventions/${iid}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  deleteIntervention: (rid: number, iid: number) =>
    fetch(`${BASE}/reports/${rid}/interventions/${iid}`, { method: "DELETE" }),
  deleteReport: (id: number) => fetch(`${BASE}/reports/${id}`, { method: "DELETE" }),
  exportDocx: (id: number) => window.open(`${BASE}/export/${id}`, "_blank"),
  getDoctors: () => fetch(`${BASE}/doctors`).then(r => r.json()),
  createDoctor: (data: object) =>
    fetch(`${BASE}/doctors`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  updateDoctor: (id: number, data: object) =>
    fetch(`${BASE}/doctors/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  getOptions: () => fetch(`${BASE}/options`).then(r => r.json()),
  updateOption: (key: string, items: string[]) =>
    fetch(`${BASE}/options/${key}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(items) }).then(r => r.json()),
}
