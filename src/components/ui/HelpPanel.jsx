import React, { useState } from 'react';
import { FiHelpCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './HelpPanel.css';

/**
 * Collapsible "Hướng dẫn sử dụng" block, placed at the top of a tool page.
 * children can be any JSX — typically a list of numbered steps + a tips block.
 */
export function HelpPanel({ title = 'Hướng dẫn sử dụng', children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="hlp-panel">
      <button className="hlp-toggle" onClick={() => setOpen(o => !o)}>
        <FiHelpCircle /> {title}
        {open ? <FiChevronUp className="hlp-chevron" /> : <FiChevronDown className="hlp-chevron" />}
      </button>
      {open && <div className="hlp-body">{children}</div>}
    </div>
  );
}

export function HelpSteps({ steps }) {
  return (
    <ol className="hlp-steps">
      {steps.map((s, i) => <li key={i}>{s}</li>)}
    </ol>
  );
}

export function HelpTip({ children }) {
  return <p className="hlp-tip">💡 {children}</p>;
}

export function HelpWarning({ children }) {
  return <p className="hlp-warning">⚠️ {children}</p>;
}

/**
 * Small inline (?) icon with hover tooltip — for placing next to a specific
 * form field/label when a short explanation is needed.
 */
export function FieldHint({ text }) {
  return (
    <span className="hlp-hint-wrap">
      <span className="hlp-hint-icon"><FiHelpCircle /></span>
      <span className="hlp-hint-box">{text}</span>
    </span>
  );
}
