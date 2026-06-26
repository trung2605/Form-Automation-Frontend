import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import MermaidGraph from "./MermaidGraph";
import "./FormConfigEditor.css";

function FieldCard({ entryKey, fieldData, onChange, cardRef, formRouting }) {
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
    <div className="field-card" ref={cardRef}>
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
                {fieldData.optionTargets && fieldData.optionTargets[opt] && fieldData.optionTargets[opt] !== '-2' && (
                  <span className="routing-badge" title={`Option này dẫn tới nhánh ${fieldData.optionTargets[opt]}`}>
                    {fieldData.optionTargets[opt] === '0' || fieldData.optionTargets[opt] === '-1' ? '➔ Gửi Form' : '➔ Nhảy nhánh'}
                  </span>
                )}
                {fieldData.optionTargets && fieldData.optionTargets[opt] === '-2' && (
                  <span className="routing-badge" style={{backgroundColor: '#f5f5f5', color: '#595959', borderColor: '#d9d9d9'}} title="Tiếp tục phần tiếp theo">
                    ➔ Tiếp tục
                  </span>
                )}
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

export default function FormConfigEditor({ formConfig, onChange, formRouting = [] }) {
  const [navWidth, setNavWidth] = useState(260); // px
  const [panelWidth, setPanelWidth] = useState(55); // flex %
  const [activeKey, setActiveKey] = useState(null);
  const draggingNav = useRef(false);
  const draggingCenter = useRef(false);
  const containerRef = useRef(null);
  const cardRefs = useRef({});
  const listRef = useRef(null);
  const [rightTab, setRightTab] = useState("flowchart"); // "json" or "flowchart"

  let parsed = null;
  try { parsed = JSON.parse(formConfig); } catch (_) {}

  const entries = parsed ? Object.entries(parsed) : [];

  const mermaidCode = useMemo(() => {
    if (!formRouting || !formRouting.length || !parsed) return '';
    let md = 'graph TD\n';
    md += '  classDef normalQ fill:#FFFFFF,stroke:#D1CDC7,stroke-width:1px,color:#141413,rx:8px,ry:8px;\n';
    md += '  classDef branchQ fill:#FCFBFA,stroke:#F37338,stroke-width:2px,color:#CF4500;\n';
    md += '  classDef endNode fill:#F37338,stroke:#CF4500,stroke-width:2px,color:#FFFFFF;\n';
    md += '  classDef emptyPage fill:#F3F0EE,stroke:#D1CDC7,stroke-width:1px,color:#696969,stroke-dasharray: 5 5;\n';

    const pageEntryNodes = {};
    const pageExitNodes = {};

    formRouting.forEach((page, idx) => {
      let pageName = `Trang ${idx + 1}`;
      if (idx === 0) pageName = "Bắt đầu";
      if (page.page_id && page.page_id !== 'none') pageName += ` (ID: ${page.page_id})`;
      
      md += `  subgraph P${idx} ["${pageName}"]\n`;
      md += `    direction TB\n`;
      
      const entriesList = page.entries || [];
      if (entriesList.length === 0) {
        const dummyId = `P${idx}_dummy`;
        md += `    ${dummyId}["Không có câu hỏi"]:::emptyPage\n`;
        pageEntryNodes[idx] = dummyId;
        pageExitNodes[idx] = dummyId;
      } else {
        let prevNodeId = null;
        entriesList.forEach((entry, i) => {
          const cfg = parsed[entry];
          const safeEntry = entry.replace(/\./g, '_');
          const isBranching = cfg && cfg.optionTargets && Object.keys(cfg.optionTargets).length > 0;
          
          let safeLabel = (cfg ? (cfg.label || entry) : entry).replace(/"/g, "'");
          if (safeLabel.length > 50) safeLabel = safeLabel.substring(0, 50) + '...';
          
          const nodeId = `Q_${safeEntry}`;
          if (isBranching) {
            md += `    ${nodeId}{"${safeLabel}"}:::branchQ\n`;
          } else {
            md += `    ${nodeId}("${safeLabel}"):::normalQ\n`;
          }

          if (i === 0) pageEntryNodes[idx] = nodeId;
          if (prevNodeId) {
            md += `    ${prevNodeId} --> ${nodeId}\n`;
          }
          prevNodeId = nodeId;
        });
        pageExitNodes[idx] = prevNodeId;
      }
      md += `  end\n`;
    });
    
    md += '  End(("Gửi Form / Hoàn tất")):::endNode\n';

    formRouting.forEach((page, idx) => {
      const exitNode = pageExitNodes[idx];
      let hasBranching = false;
      let branchKey = null;

      const entriesList = page.entries || [];
      for (const entry of entriesList) {
        const cfg = parsed[entry];
        if (cfg && cfg.optionTargets && Object.keys(cfg.optionTargets).length > 0) {
          hasBranching = true;
          branchKey = entry;
          break; 
        }
      }

      if (hasBranching) {
        const cfg = parsed[branchKey];
        const safeBranchKey = branchKey.replace(/\./g, '_');
        const branchExitNode = `Q_${safeBranchKey}`;
        
        Object.entries(cfg.optionTargets).forEach(([opt, target]) => {
          const safeOpt = opt.replace(/"/g, "'");
          if (target === '-1' || target === '0') {
            md += `  ${branchExitNode} -- "${safeOpt}" --> End\n`;
          } else if (target === '-2') {
            if (idx + 1 < formRouting.length) {
              md += `  ${branchExitNode} -- "${safeOpt}" --> ${pageEntryNodes[idx + 1]}\n`;
            } else {
              md += `  ${branchExitNode} -- "${safeOpt}" --> End\n`;
            }
          } else {
            const targetIdx = formRouting.findIndex(p => String(p.page_id) === String(target));
            if (targetIdx !== -1) {
              md += `  ${branchExitNode} -- "${safeOpt}" --> ${pageEntryNodes[targetIdx]}\n`;
            } else {
              md += `  ${branchExitNode} -- "${safeOpt}" --> End\n`;
            }
          }
        });
      } else {
        if (idx + 1 < formRouting.length) {
          md += `  ${exitNode} --> ${pageEntryNodes[idx + 1]}\n`;
        } else {
          md += `  ${exitNode} --> End\n`;
        }
      }
    });

    return md;
  }, [formRouting, parsed]);

  const handleFieldChange = useCallback((key, newField) => {
    if (!parsed) return;
    const updated = { ...parsed, [key]: newField };
    onChange(JSON.stringify(updated, null, 2));
  }, [parsed, onChange]);

  const scrollToCard = (key) => {
    setActiveKey(key);
    const el = cardRefs.current[key];
    if (el && listRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const onMouseDownNav = (e) => {
    e.preventDefault();
    draggingNav.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const onMouseDownCenter = (e) => {
    e.preventDefault();
    draggingCenter.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!containerRef.current) return;
      if (!draggingNav.current && !draggingCenter.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      
      if (draggingNav.current) {
        let newNav = e.clientX - rect.left;
        setNavWidth(Math.max(150, Math.min(600, newNav)));
      } else if (draggingCenter.current) {
        const startX = rect.left + navWidth + 8;
        const availableWidth = rect.width - navWidth - 16;
        const relativeX = e.clientX - startX;
        const pct = (relativeX / availableWidth) * 100;
        setPanelWidth(Math.max(15, Math.min(85, pct)));
      }
    };
    const onMouseUp = () => {
      draggingNav.current = false;
      draggingCenter.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [navWidth]);

  useEffect(() => {
    const leftPanel = listRef.current;
    if (!leftPanel) return;
    const handler = () => {
      let currentKey = null;
      for (const [key] of entries) {
        const el = cardRefs.current[key];
        if (el && el.offsetTop - leftPanel.scrollTop <= 60) {
          currentKey = key;
        }
      }
      if (currentKey) setActiveKey(currentKey);
    };
    leftPanel.addEventListener("scroll", handler);
    return () => leftPanel.removeEventListener("scroll", handler);
  }, [entries]);

  return (
    <div className="config-editor-wrapper" ref={containerRef}>
      <div className="config-nav" style={{ width: `${navWidth}px` }}>
        <div className="panel-label">Câu hỏi</div>
        <div className="config-nav-list">
          {entries.map(([key, field], idx) => {
            const displayLabel = field.label || key;
            return (
              <button
                key={key}
                className={`nav-item ${activeKey === key ? "active" : ""}`}
                onClick={() => scrollToCard(key)}
                title={displayLabel}
              >
                <span className="nav-index">{idx + 1}</span>
                <span className="nav-label">{displayLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="resize-handle" onMouseDown={onMouseDownNav}>
        <div className="resize-grip" />
      </div>

      <div className="config-left" style={{ flex: panelWidth }} ref={listRef}>
        <div className="panel-label">Cấu hình trực quan</div>
        {parsed ? (
          entries.map(([key, field]) => (
            <FieldCard
              key={key}
              entryKey={key}
              fieldData={field}
              onChange={handleFieldChange}
              cardRef={(el) => { cardRefs.current[key] = el; }}
              formRouting={formRouting}
            />
          ))
        ) : (
          <p className="parse-error">JSON không hợp lệ</p>
        )}
      </div>

      <div className="resize-handle" onMouseDown={onMouseDownCenter}>
        <div className="resize-grip" />
      </div>

      <div className="config-right" style={{ flex: 100 - panelWidth, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #d9d9d9' }}>
          <button 
            className={`tab-button ${rightTab === 'flowchart' ? 'active' : ''}`}
            onClick={() => setRightTab('flowchart')}
            style={{ flex: 1, padding: '8px', border: 'none', background: rightTab === 'flowchart' ? '#FFFFFF' : '#F3F0EE', cursor: 'pointer', borderRight: '1px solid #D1CDC7', fontWeight: rightTab === 'flowchart' ? '700' : '500', color: rightTab === 'flowchart' ? '#CF4500' : 'inherit' }}
          >
            Sơ đồ rẽ nhánh
          </button>
          <button 
            className={`tab-button ${rightTab === 'json' ? 'active' : ''}`}
            onClick={() => setRightTab('json')}
            style={{ flex: 1, padding: '8px', border: 'none', background: rightTab === 'json' ? '#FFFFFF' : '#F3F0EE', cursor: 'pointer', fontWeight: rightTab === 'json' ? '700' : '500', color: rightTab === 'json' ? '#CF4500' : 'inherit' }}
          >
            JSON (read-only)
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#fff' }}>
          {rightTab === 'json' ? (
            <pre className="json-preview" style={{ height: '100%', margin: 0 }}>{formConfig}</pre>
          ) : (
            <MermaidGraph chart={mermaidCode} />
          )}
        </div>
      </div>
    </div>
  );
}
