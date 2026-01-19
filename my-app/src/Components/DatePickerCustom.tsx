import React, { useEffect, useId, useMemo, useRef, useState } from "react";

type DatePickerPopoverProps = {
  value?: string; // controlled, "YYYY-MM-DD"
  defaultValue?: string; // uncontrolled
  onChange?: (iso: string) => void;

  label?: string;
  disabled?: boolean;
  min?: string; // "YYYY-MM-DD"
  max?: string; // "YYYY-MM-DD"
  className?: string;
  helperText?: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function isValidISODate(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00`);
  return !Number.isNaN(d.getTime()) && toISODate(d) === s;
}

function clampISO(iso: string, min?: string, max?: string) {
  let v = iso;
  if (min && isValidISODate(min) && v < min) v = min;
  if (max && isValidISODate(max) && v > max) v = max;
  return v;
}

function formatPretty(iso: string) {
  if (!isValidISODate(iso)) return "";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "2-digit" });
}

function startOfMonth(year: number, month0: number) {
  return new Date(year, month0, 1);
}

function daysInMonth(year: number, month0: number) {
  return new Date(year, month0 + 1, 0).getDate();
}

function addMonths(year: number, month0: number, delta: number) {
  const d = new Date(year, month0 + delta, 1);
  return { year: d.getFullYear(), month0: d.getMonth() };
}

function isoFromParts(year: number, month0: number, day: number) {
  return `${year}-${pad2(month0 + 1)}-${pad2(day)}`;
}

function isDisabledDay(iso: string, min?: string, max?: string) {
  if (!isValidISODate(iso)) return true;
  if (min && isValidISODate(min) && iso < min) return true;
  if (max && isValidISODate(max) && iso > max) return true;
  return false;
}

export default function DatePickerPopover({
  value,
  defaultValue = toISODate(new Date()),
  onChange,
  disabled = false,
  min,
  max,
  className,
  helperText,
}: DatePickerPopoverProps) {
  const id = useId();
  const isControlled = value !== undefined;

  const initial = useMemo(() => {
    const base = isValidISODate(defaultValue) ? defaultValue : toISODate(new Date());
    return clampISO(base, min, max);
  }, [defaultValue, min, max]);

  const [internal, setInternal] = useState<string>(initial);
  const selected = isControlled ? (value ?? "") : internal;

  const selectedSafe = useMemo(() => {
    if (!selected || !isValidISODate(selected)) return "";
    return clampISO(selected, min, max);
  }, [selected, min, max]);

  const [open, setOpen] = useState(false);

  // which month is shown
  const [view, setView] = useState(() => {
    const base = selectedSafe || initial;
    const d = new Date(`${base}T00:00:00`);
    return { year: d.getFullYear(), month0: d.getMonth() };
  });

  // keep view in sync when controlled value changes
  useEffect(() => {
    if (!selectedSafe) return;
    const d = new Date(`${selectedSafe}T00:00:00`);
    setView({ year: d.getFullYear(), month0: d.getMonth() });
  }, [selectedSafe]);

  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!open) return;
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  function commit(nextIso: string) {
    if (!isValidISODate(nextIso)) return;
    const clamped = clampISO(nextIso, min, max);

    if (!isControlled) setInternal(clamped);
    onChange?.(clamped);
  }

  const pretty = selectedSafe ? formatPretty(selectedSafe) : "Pick a date…";

  const monthLabel = new Date(view.year, view.month0, 1).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });

  // Calendar grid calc (Mon-first)
  const first = startOfMonth(view.year, view.month0);
  const firstDowSun0 = first.getDay(); // 0..6 Sun..Sat
  const firstDowMon0 = (firstDowSun0 + 6) % 7; // 0..6 Mon..Sun
  const dim = daysInMonth(view.year, view.month0);
  const cells: Array<{ iso: string; day: number; inMonth: boolean }> = [];

  // previous month trailing days
  const prev = addMonths(view.year, view.month0, -1);
  const prevDim = daysInMonth(prev.year, prev.month0);

  for (let i = 0; i < firstDowMon0; i++) {
    const day = prevDim - (firstDowMon0 - 1 - i);
    cells.push({ iso: isoFromParts(prev.year, prev.month0, day), day, inMonth: false });
  }

  // current month
  for (let day = 1; day <= dim; day++) {
    cells.push({ iso: isoFromParts(view.year, view.month0, day), day, inMonth: true });
  }

  // next month leading days to complete 6 rows (42 cells)
  const next = addMonths(view.year, view.month0, 1);
  while (cells.length < 42) {
    const day = cells.length - (firstDowMon0 + dim) + 1;
    cells.push({ iso: isoFromParts(next.year, next.month0, day), day, inMonth: false });
  }

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const canGoPrev = useMemo(() => {
    if (!min || !isValidISODate(min)) return true;
    // prev month last day must be >= min to allow navigating back
    const prevView = addMonths(view.year, view.month0, -1);
    const lastPrevIso = isoFromParts(prevView.year, prevView.month0, daysInMonth(prevView.year, prevView.month0));
    return lastPrevIso >= min;
  }, [min, view.year, view.month0]);

  const canGoNext = useMemo(() => {
    if (!max || !isValidISODate(max)) return true;
    // next month first day must be <= max to allow navigating forward
    const nextView = addMonths(view.year, view.month0, 1);
    const firstNextIso = isoFromParts(nextView.year, nextView.month0, 1);
    return firstNextIso <= max;
  }, [max, view.year, view.month0]);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", maxWidth: 520 }}
    >
      <style>{`
        .dp2-wrap { display: grid; gap: 8px; position: relative; }
        .dp2-head { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
        .dp2-label { font-size: 14px; font-weight: 600; }
        .dp2-helper { font-size: 12px; color: #6B7280; }

        .dp2-button {
          width: 100%;
          height: 40px;
          padding: 0 12px;
          border-radius: 12px;
          border: 1px solid #E5E7EB;
          background: #ffffff;
          color: #111827;
          font-size: 14px;
          text-align: left;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          cursor: pointer;
        }
        .dp2-button:focus {
          outline: none;
          border-color: #111827;
          box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.12);
        }
        .dp2-button:disabled {
          background: #F3F4F6;
          color: #6B7280;
          cursor: not-allowed;
        }

        .dp2-pop {
          position: absolute;
          top: calc(40px + 8px);
          left: 0;
          width: 320px;
          border: 1px solid #E5E7EB;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
          padding: 12px;
          z-index: 50;
        }

        .dp2-pophead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 10px;
        }
        .dp2-navbtn {
          height: 32px;
          min-width: 32px;
          padding: 0 10px;
          border-radius: 10px;
          border: 1px solid #E5E7EB;
          background: #000000;
          cursor: pointer;
        }
        .dp2-navbtn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .dp2-month {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .dp2-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }
        .dp2-dow {
          font-size: 12px;
          color: #6B7280;
          text-align: center;
          padding: 6px 0;
        }
        .dp2-day {
          height: 36px;
          border-radius: 12px;
          border: 1px solid #E5E7EB;
          background: #ffffff;
          color: #111827;
          cursor: pointer;
          font-size: 13px;
        }
        .dp2-day:hover { border-color: #111827; }
        .dp2-day[aria-disabled="true"] {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .dp2-day--off { color: #6B7280; }
        .dp2-day--selected {
          background: #111827;
          color: #ffffff;
          border-color: #111827;
        }
        .dp2-foot {
          margin-top: 10px;
          display: flex;
          justify-content: space-between;
          gap: 8px;
        }
        .dp2-smallbtn {
          height: 32px;
          padding: 0 10px;
          border-radius: 10px;
          border: 1px solid #E5E7EB;
          background: #ffffff;
          cursor: pointer;
          font-size: 13px;
        }
      `}</style>

      <div className="dp2-wrap">

        <button
          id={id}
          type="button"
          className="dp2-button"
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            setOpen((v) => !v);
          }}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span style={{ fontVariantNumeric: "tabular-nums", color: selectedSafe ? "#111827" : "#6B7280" }}>{pretty}</span>
          <span aria-hidden style={{ color: "#6B7280" }}>
            ▾
          </span>
        </button>

        {open && !disabled && (
          <div className="dp2-pop" role="dialog" aria-label="Choose date">
            <div className="dp2-pophead">
              <button
                type="button"
                className="dp2-navbtn"
                onClick={() => canGoPrev && setView(addMonths(view.year, view.month0, -1))}
                disabled={!canGoPrev}
                aria-label="Previous month"
              >
                ‹
              </button>
              <div className="dp2-month">{monthLabel}</div>
              <button
                type="button"
                className="dp2-navbtn"
                onClick={() => canGoNext && setView(addMonths(view.year, view.month0, 1))}
                disabled={!canGoNext}
                aria-label="Next month"
              >
                ›
              </button>
            </div>

            <div className="dp2-grid" style={{ marginBottom: 6 }}>
              {weekDays.map((d) => (
                <div key={d} className="dp2-dow">
                  {d}
                </div>
              ))}
            </div>

            <div className="dp2-grid">
              {cells.map((c) => {
                const dis = isDisabledDay(c.iso, min, max);
                const isSel = selectedSafe && c.iso === selectedSafe;

                return (
                  <button
                    key={c.iso}
                    type="button"
                    className={[
                      "dp2-day",
                      !c.inMonth ? "dp2-day--off" : "",
                      isSel ? "dp2-day--selected" : "",
                    ].join(" ")}
                    aria-disabled={dis}
                    disabled={dis}
                    onClick={() => {
                      if (dis) return;
                      commit(c.iso);
                      setOpen(false);
                    }}
                    title={c.iso}
                  >
                    {c.day}
                  </button>
                );
              })}
            </div>

            <div className="dp2-foot">
              <button
                type="button"
                className="dp2-smallbtn"
                onClick={() => {
                  const today = clampISO(toISODate(new Date()), min, max);
                  commit(today);
                  setView(() => {
                    const d = new Date(`${today}T00:00:00`);
                    return { year: d.getFullYear(), month0: d.getMonth() };
                  });
                  setOpen(false);
                }}
              >
                Today
              </button>
              <button type="button" className="dp2-smallbtn" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}

        {helperText ? <div className="dp2-helper">{helperText}</div> : null}
      </div>
    </div>
  );
}

/**
 * Usage:
 * const [date, setDate] = useState("2026-01-19");
 * <DatePickerPopover value={date} onChange={setDate} min="2025-01-01" max="2027-12-31" />
 *
 * or uncontrolled:
 * <DatePickerPopover defaultValue="2026-01-19" onChange={(d)=>console.log(d)} />
 */
