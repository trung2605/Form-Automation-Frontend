import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import DOMPurify from 'dompurify';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    fontFamily: '"Sofia Sans", Arial, sans-serif',
    primaryColor: '#FCFBFA',
    primaryTextColor: '#141413',
    primaryBorderColor: '#D1CDC7',
    lineColor: '#696969',
    secondaryColor: '#F37338',
    tertiaryColor: '#CF4500'
  },
  securityLevel: 'loose',
});

export default function MermaidGraph({ chart }) {
  const ref = useRef(null);
  const [svgStr, setSvgStr] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (chart) {
      let isMounted = true;
      setError(null);
      
      const renderChart = async () => {
        try {
          const id = `mermaid-svg-${Math.round(Math.random() * 1000000)}`;
          const { svg } = await mermaid.render(id, chart);
          if (isMounted) {
            setSvgStr(svg);
          }
        } catch (err) {
          console.error("Mermaid parsing error", err);
          if (isMounted) {
            setError(err.message || 'Lỗi vẽ biểu đồ');
          }
        }
      };
      
      renderChart();
      return () => { isMounted = false; };
    }
  }, [chart]);

  if (error) {
    return <div style={{ color: 'red', padding: '10px' }}>{error}</div>;
  }

  return (
    <div
      ref={ref}
      style={{ display: 'flex', justifyContent: 'center', padding: '10px', width: '100%', overflowX: 'auto', minHeight: '300px' }}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(svgStr) }}
    />
  );
}
