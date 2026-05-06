import { useMemo, useRef, useEffect } from "react"

interface Props {
  label: string                    // "Ballon SC" or "Ballon NC"
  value: string                    // current stored balloon string
  onChange: (next: string) => void
  listId: string                   // datalist id
  options: string[]                // datalist options
  defaultKind?: "SC" | "NC"        // default kind for generic mode
}

// Parse a generic balloon string like "Ballon SC 2.5 x 12 mm" → { kind, d, l }
function parseGeneric(s: string): { kind: "SC" | "NC"; d: string; l: string } | null {
  const m = s.match(/^Ballon\s+(SC|NC)\s+([\d.]+)\s*x\s*(\d+)\s*mm\s*$/i)
  if (!m) return null
  return { kind: m[1].toUpperCase() as "SC" | "NC", d: m[2], l: m[3] }
}

export default function BalloonInput({ label, value, onChange, listId, options, defaultKind = "SC" }: Props) {
  const parsed = useMemo(() => parseGeneric(value), [value])
  const isGeneric = parsed !== null

  // Remember the last non-generic value so unchecking restores the previous catalog entry.
  const lastCatalog = useRef<string>(isGeneric ? "" : value)
  useEffect(() => {
    if (!isGeneric) lastCatalog.current = value
  }, [value, isGeneric])

  function toggleGeneric() {
    if (isGeneric) {
      onChange(lastCatalog.current)
    } else {
      onChange(`Ballon ${defaultKind}  x  mm`)  // placeholder, will be edited inline
    }
  }

  function updateGeneric(patch: Partial<{ kind: "SC" | "NC"; d: string; l: string }>) {
    const cur = parsed ?? { kind: defaultKind, d: "", l: "" }
    const next = { ...cur, ...patch }
    onChange(`Ballon ${next.kind} ${next.d} x ${next.l} mm`.replace(/\s+/g, " ").trim())
  }

  return (
    <div className="flex flex-col flex-1 min-w-60 gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">{label}</span>
        <label className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer">
          <input type="checkbox" checked={isGeneric} onChange={toggleGeneric} />
          Ballon générique (hors liste)
        </label>
      </div>
      {!isGeneric && (
        <input
          list={listId}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="border rounded px-2 py-1"
          placeholder="Ex: TREK 2.5 x 12 mm (Abbott)"
        />
      )}
      {isGeneric && (
        <div className="flex items-center gap-2">
          <select
            value={parsed!.kind}
            onChange={e => updateGeneric({ kind: e.target.value as "SC" | "NC" })}
            className="border rounded px-1 py-1 text-xs"
          >
            <option value="SC">SC</option>
            <option value="NC">NC</option>
          </select>
          <span className="text-[10px] text-gray-500">Ø</span>
          <input
            type="text"
            value={parsed!.d}
            onChange={e => updateGeneric({ d: e.target.value.replace(",", ".") })}
            className="border rounded px-2 py-1 text-xs w-16"
            placeholder="2.5"
          />
          <span className="text-[10px] text-gray-500">mm × L</span>
          <input
            type="text"
            value={parsed!.l}
            onChange={e => updateGeneric({ l: e.target.value })}
            className="border rounded px-2 py-1 text-xs w-16"
            placeholder="12"
          />
          <span className="text-[10px] text-gray-500">mm</span>
          <span className="ml-auto text-[10px] italic text-gray-500 truncate">→ {value}</span>
        </div>
      )}
      <datalist id={listId}>
        {options.map(b => <option key={b} value={b} />)}
      </datalist>
    </div>
  )
}
