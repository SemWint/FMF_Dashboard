import React, { useId, useMemo, useState } from "react";

type TimeRange = { startMinutes: number; endMinutes: number };

type TimeRangeSliderProps = {
  minMinutes?: number; // default 0
  maxMinutes?: number; // default 24*60
  stepMinutes?: number; // default 15

  value?: TimeRange;
  defaultValue?: TimeRange;
  onChange?: (next: TimeRange) => void;

  format?: "24h" | "12h";
  label?: string;
  disabled?: boolean;
  className?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatTime(minutesSinceMidnight: number, fmt: "24h" | "12h") {
  const m = ((minutesSinceMidnight % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh = Math.floor(m / 60);
  const mm = m % 60;

  if (fmt === "24h") return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;

  const suffix = hh >= 12 ? "PM" : "AM";
  const hour12 = ((hh + 11) % 12) + 1;
  return `${hour12}:${String(mm).padStart(2, "0")} ${suffix}`;
}

export default function TimeRangeSlider(props: TimeRangeSliderProps) {
  const {
    minMinutes = 0,
    maxMinutes = 24 * 60,
    stepMinutes = 15,
    value,
    defaultValue = { startMinutes: 9 * 60, endMinutes: 17 * 60 },
    onChange,
    format = "24h",
    label = "Time range",
    disabled = false,
    className,
  } = props;

  const id = useId();
  const isControlled = value != null;

  const [internal, setInternal] = useState<TimeRange>(() => {
    const a = clamp(defaultValue.startMinutes, minMinutes, maxMinutes);
    const b = clamp(defaultValue.endMinutes, minMinutes, maxMinutes);
    return a <= b ? { startMinutes: a, endMinutes: b } : { startMinutes: b, endMinutes: a };
  });

  // Track which thumb was last interacted with so it stays "on top"
  const [activeThumb, setActiveThumb] = useState<"start" | "end">("start");

  const current = isControlled ? value! : internal;

  const safe = useMemo(() => {
    const a = clamp(current.startMinutes, minMinutes, maxMinutes);
    const b = clamp(current.endMinutes, minMinutes, maxMinutes);
    return a <= b ? { startMinutes: a, endMinutes: b } : { startMinutes: b, endMinutes: a };
  }, [current.startMinutes, current.endMinutes, minMinutes, maxMinutes]);

  const startPct = ((safe.startMinutes - minMinutes) / (maxMinutes - minMinutes)) * 100;
  const endPct = ((safe.endMinutes - minMinutes) / (maxMinutes - minMinutes)) * 100;

  function commit(next: TimeRange) {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  }

  const handleStart = (v: number) => {
    const nextStart = clamp(v, minMinutes, safe.endMinutes);
    commit({ startMinutes: nextStart, endMinutes: safe.endMinutes });
  };

  const handleEnd = (v: number) => {
    const nextEnd = clamp(v, safe.startMinutes, maxMinutes);
    commit({ startMinutes: safe.startMinutes, endMinutes: nextEnd });
  };

  const startText = formatTime(safe.startMinutes, format);
  const endText = formatTime(safe.endMinutes, format);

  return (
    <div className={className} style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", maxWidth:800 }}>
      {/* Local CSS for thumbs (required for reliable dragging + visibility) */}
      <style>{`
        .trs-wrap { position: relative; height: 40px; }
        .trs-track {
          position: absolute; left: 0; right: 0; top: 50%;
          transform: translateY(-50%);
          height: 8px; border-radius: 999px; background: #E5E7EB;
        }
        .trs-range {
          position: absolute; top: 50%; transform: translateY(-50%);
          height: 8px; border-radius: 999px; background: #111827;
        }

        /* Make the whole input not block clicks; only the thumb should capture drag */
        input.trs-input {
          position: absolute; left: 0; top: 0; width: 100%; height: 40px;
          margin: 0; background: transparent;
          -webkit-appearance: none; appearance: none;
          pointer-events: none; /* key fix */
        }

        /* Thumb is draggable */
        input.trs-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px; height: 18px; border-radius: 999px;
          background: #ffffff;
          border: 2px solid #111827;
          box-shadow: 0 1px 2px rgba(0,0,0,0.15);
          pointer-events: auto; /* key fix */
          cursor: pointer;
        }
        input.trs-input::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 999px;
          background: #ffffff;
          border: 2px solid #111827;
          box-shadow: 0 1px 2px rgba(0,0,0,0.15);
          pointer-events: auto;
          cursor: pointer;
        }

        /* Hide default track visuals */
        input.trs-input::-webkit-slider-runnable-track { background: transparent; }
        input.trs-input::-moz-range-track { background: transparent; }

        input.trs-input:disabled::-webkit-slider-thumb,
        input.trs-input:disabled::-moz-range-thumb {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
        <label htmlFor={`${id}-start`} style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
          {label}
        </label>
        <div style={{ fontSize: 14, fontVariantNumeric: "tabular-nums", color: "#374151" }}>
          {startText} – {endText}
        </div>
      </div>

      <div className="trs-wrap">
        <div className="trs-track" aria-hidden />
        <div
          className="trs-range"
          aria-hidden
          style={{
            left: `${startPct}%`,
            width: `${Math.max(0, endPct - startPct)}%`,
            background: disabled ? "#9CA3AF" : "#111827",
            opacity: disabled ? 0.6 : 1,
          }}
        />

        {/* Start thumb */}
        <input
          id={`${id}-start`}
          className="trs-input"
          type="range"
          min={minMinutes}
          max={maxMinutes}
          step={stepMinutes}
          value={safe.startMinutes}
          disabled={disabled}
          aria-label="Start time"
          onPointerDown={() => setActiveThumb("start")}
          onChange={(e) => handleStart(Number(e.target.value))}
          style={{ zIndex: activeThumb === "start" ? 3 : 2 }}
        />

        {/* End thumb */}
        <input
          id={`${id}-end`}
          className="trs-input"
          type="range"
          min={minMinutes}
          max={maxMinutes}
          step={stepMinutes}
          value={safe.endMinutes}
          disabled={disabled}
          aria-label="End time"
          onPointerDown={() => setActiveThumb("end")}
          onChange={(e) => handleEnd(Number(e.target.value))}
          style={{ zIndex: activeThumb === "end" ? 3 : 2 }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6B7280", marginTop: 6 }}>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatTime(minMinutes, format)}</span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatTime(maxMinutes, format)}</span>
      </div>
    </div>
  );
}

/**
 * Example:
 * export default function Demo() {
 *   const [range, setRange] = useState({ startMinutes: 8 * 60, endMinutes: 18 * 60 });
 *   return (
 *     <div style={{ padding: 24 }}>
 *       <TimeRangeSlider value={range} onChange={setRange} stepMinutes={15} />
 *     </div>
 *   );
 * }
 */
