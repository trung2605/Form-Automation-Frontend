import React, { useRef, useState, useCallback, useEffect } from "react";
import "./FormConfigEditor.css";

function FieldCard({ entryKey, fieldData, onChange }) {
  const isChoice = fieldData.type === "choice" && Array.isArray(fieldData.options);

  const handleWeightChange = (index, newPct) => {
    const options = fieldData.options;
    const newVal = Math.max(0, Math.min(100, newPct)) / 100;
    const oldVal = fieldData.weights[index];
    const delta = newVal - oldVal;
    const otherIndices = options.map((_, i) => i).filter((i) => i !== index);
    const otherSum = otherIndices.reduce((s, i) => s + fieldData.weights[i], 0);

    const newWeights = [...fieldData.weights];
    newWeights[index] = newVal;

    if (otherSum > 0) {
      otherIndices.forEach((i) => {
        newWeights[i] = Math.max(0, fieldData.weights[i] - delta * (fieldData.weights[i] / otherSum));
      });
    } else {
      const share = (1 - newVal) / otherIndices.length;
      otherIndices.forEach((i) => { newWeights[i] = share; });
    }

    const sum = newWeights.reduce((s, v) => s + v, 0);
    const normalized = newWeights.map((w) => w / sum);
    onChange(entryKey, { ...fieldData, weights: normalized });
  };

  return (
    <div className="field-card">
      <div className="field-card-header">
        <span className="field-entry-key">{entryKey}</span>
        <span className={`field-type-badge ${fieldData.type}`}>{fieldData.type}</span>
      </div>
      {fieldData.label && (
        <p className="field-label">{fieldData.label}</p>
      )}
      {isChoice ? (
        <div className="field-options">
          {fieldData.options.map((opt, i) => {
            const raw = (fieldData.weights?.[i] ?? 1 / fieldData.options.length) * 100;
            const pctInt = Math.round(raw);
            const pctDisplay = Number.isInteger(raw) ? raw.toFixed(0) : raw.toFixed(1);
            return (
              <div key={i} className="option-row">
                <span className="option-label">{opt}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={pctInt}
                  onChange={(e) => handleWeightChange(i, Number(e.target.value))}
                  className="weight-slider"
                />
                <span className="weight-pct">{pctDisplay}%</span>
              </div>
            );
          })}
          <WeightTotal weights={fieldData.weights} />
        </div>
      ) : (
        <p className="field-no-config">Không cần cấu hình thêm</p>
      )}
    </div>
  );
}

function WeightTotal({ weights }) {
  if (!weights) return null;
  const raw = weights.reduce((s, v) => s + v, 0) * 100;
  const ok = Math.abs(raw - 100) < 0.5;
  const display = raw.toFixed(raw % 1 === 0 ? 0 : 1);
  return (
    <div className={`weight-total ${ok ? "ok" : "error"}`}>
      Tổng: {display}% {ok ? "✓" : "⚠ phải = 100%"}
    </div>
  );
}

export default function FormConfigEditor({ formConfig, onChange }) {
  const [panelWidth, setPanelWidth] = useState(55);
  const dragging = useRef(false);
  const containerRef = useRef(null);

  let parsed = null;
  try { parsed = JSON.parse(formConfig); } catch (_) {}

  const handleFieldChange = useCallback((key, newField) => {
    if (!parsed) return;
    const updated = { ...parsed, [key]: newField };
    onChange(JSON.stringify(updated, null, 2));
  }, [parsed, onChange]);

  const onMouseDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setPanelWidth(Math.max(25, Math.min(75, pct)));
    };
    const onMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <div className="config-editor-wrapper" ref={containerRef}>
      <div className="config-left" style={{ width: `${panelWidth}%` }}>
        <div className="panel-label">Cấu hình trực quan</div>
        {parsed ? (
          Object.entries(parsed).map(([key, field]) => (
            <FieldCard key={key} entryKey={key} fieldData={field} onChange={handleFieldChange} />
          ))
        ) : (
          <p className="parse-error">JSON không hợp lệ</p>
        )}
      </div>

      <div className="resize-handle" onMouseDown={onMouseDown}>
        <div className="resize-grip" />
      </div>

      <div className="config-right" style={{ width: `${100 - panelWidth}%` }}>
        <div className="panel-label">JSON (read-only)</div>
        <pre className="json-preview">{formConfig}</pre>
      </div>
    </div>
  );
}
