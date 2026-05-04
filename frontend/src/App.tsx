import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import ReportList from "./pages/ReportList"
import ReportForm from "./pages/ReportForm"
import Settings from "./pages/Settings"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReportList />} />
        <Route path="/reports/new" element={<ReportForm />} />
        <Route path="/reports/:id" element={<ReportForm />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
