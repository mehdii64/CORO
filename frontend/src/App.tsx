import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import ReportList from "./pages/ReportList"
import ReportForm from "./pages/ReportForm"
import Settings from "./pages/Settings"

function Header() {
  const nav = useNavigate()
  const loc = useLocation()
  const onForm = loc.pathname.startsWith("/reports/")

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-blue-800 text-white h-14 flex items-center px-6 shadow-md">
      <button
        onClick={() => nav("/")}
        className="text-white font-bold text-lg tracking-tight hover:text-blue-200 transition-colors"
      >
        Cathlab · Comptes Rendus
      </button>
      <div className="ml-auto flex items-center gap-3">
        {!onForm && (
          <button
            onClick={() => nav("/settings")}
            className="text-blue-200 hover:text-white text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configuration
          </button>
        )}
      </div>
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <div className="pt-14 min-h-screen">
        <Routes>
          <Route path="/" element={<ReportList />} />
          <Route path="/reports/new" element={<ReportForm />} />
          <Route path="/reports/:id" element={<ReportForm />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
