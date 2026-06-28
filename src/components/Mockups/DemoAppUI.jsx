import React, { useState, useEffect, useRef } from 'react';

export default function DemoAppUI() {
  const [url, setUrl] = useState('https://docs.google.com/forms/d/e/1FAIpQLSf...');
  const [proxyEnabled, setProxyEnabled] = useState(true);
  const [captchaEnabled, setCaptchaEnabled] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const logsContainerRef = useRef(null);

  const totalRequests = 1000;
  const currentRequests = Math.floor((progress / 100) * totalRequests);

  const startSimulation = (e) => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }
    
    setIsRunning(true);
    setProgress(0);
    setLogs([
      { time: new Date().toLocaleTimeString('en-US', { hour12: false }), msg: 'Khởi tạo chiến dịch...', type: 'info' }
    ]);
  };

  useEffect(() => {
    let timer;
    if (isRunning && progress < 100) {
      timer = setTimeout(() => {
        const nextProgress = progress + Math.random() * 15;
        if (nextProgress >= 100) {
          setProgress(100);
          setIsRunning(false);
          addLog('Chiến dịch hoàn tất 100%.', 'success');
        } else {
          setProgress(nextProgress);
          generateRandomLog();
        }
      }, 800 + Math.random() * 1000);
    }
    return () => clearTimeout(timer);
  }, [isRunning, progress]);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg, type) => {
    setLogs(prev => [...prev, {
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      msg,
      type
    }].slice(-6)); // keep last 6 logs
  };

  const generateRandomLog = () => {
    const actions = [
      { msg: 'Submitting payload to Google Form...', type: 'info' },
      { msg: '[200 OK] Response received', type: 'success' },
      { msg: 'Rotating proxy (IP: 103.x.x.x)', type: 'warn' },
      { msg: 'Solving reCAPTCHA v3 challenge...', type: 'info' },
      { msg: 'AST Logic: Chose branch B (55%)', type: 'info' },
      { msg: 'Mocking human typing latency...', type: 'info' }
    ];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    addLog(randomAction.msg, randomAction.type);
  };

  return (
    <div className="demo-web-ui">
      <div className="demo-web-header">
        <div className="demo-header-title">
          <div className="demo-logo-mini"></div>
          <h4>Chiến dịch: Khảo sát Hành vi 2026</h4>
        </div>
        <div className="demo-header-actions">
          <span className="demo-badge-outline">Thread: 24/50</span>
          <span className="demo-badge">{isRunning ? 'Active' : 'Idle'}</span>
        </div>
      </div>
      
      <div className="demo-web-body-grid">
        {/* Left Column: Settings */}
        <div className="demo-col demo-settings">
          <div className="demo-input-group">
            <label>Mục tiêu (Target URL)</label>
            <input 
              type="text" 
              className="demo-fake-input-field" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              disabled={isRunning}
            />
          </div>
          
          <div className="demo-switches">
            <div className="demo-switch-row" onClick={() => !isRunning && setProxyEnabled(!proxyEnabled)} style={{ cursor: isRunning ? 'not-allowed' : 'pointer' }}>
              <span className="switch-label">Smart Proxy Rotation</span>
              <div className={`switch-track ${proxyEnabled ? 'active' : ''}`}><div className="switch-knob"></div></div>
            </div>
            <div className="demo-switch-row" onClick={() => !isRunning && setCaptchaEnabled(!captchaEnabled)} style={{ cursor: isRunning ? 'not-allowed' : 'pointer' }}>
              <span className="switch-label">Bypass reCAPTCHA v3</span>
              <div className={`switch-track ${captchaEnabled ? 'active' : ''}`}><div className="switch-knob"></div></div>
            </div>
          </div>
          
          <div className="demo-ratios">
            <label style={{ fontSize: '13px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '8px', marginBottom: '12px' }}>
              Cấu hình Tỉ lệ Câu trả lời (Randomizer)
            </label>
            
            {/* Câu 1 */}
            <div className="demo-question-block" style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', fontSize: '12px', color: 'var(--ink-black)', marginBottom: '8px' }}>Câu 1: Độ tuổi của bạn?</div>
              <div className="demo-ratio-item">
                <div className="ratio-info"><span>Dưới 18 tuổi</span><span>10%</span></div>
                <div className="ratio-bar-bg"><div className="ratio-bar-fill fill-orange" style={{ width: '10%' }}></div></div>
              </div>
              <div className="demo-ratio-item">
                <div className="ratio-info"><span>18 - 24 tuổi</span><span>40%</span></div>
                <div className="ratio-bar-bg"><div className="ratio-bar-fill fill-blue" style={{ width: '40%' }}></div></div>
              </div>
              <div className="demo-ratio-item">
                <div className="ratio-info"><span>25 - 34 tuổi</span><span>35%</span></div>
                <div className="ratio-bar-bg"><div className="ratio-bar-fill fill-green" style={{ width: '35%' }}></div></div>
              </div>
              <div className="demo-ratio-item">
                <div className="ratio-info"><span>Trên 35 tuổi</span><span>15%</span></div>
                <div className="ratio-bar-bg"><div className="ratio-bar-fill" style={{ width: '15%', background: '#8b5cf6' }}></div></div>
              </div>
            </div>

            {/* Câu 2 */}
            <div className="demo-question-block" style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', fontSize: '12px', color: 'var(--ink-black)', marginBottom: '8px' }}>Câu 2: Kênh mua sắm ưu thích?</div>
              <div className="demo-ratio-item">
                <div className="ratio-info"><span>Shopee</span><span>60%</span></div>
                <div className="ratio-bar-bg"><div className="ratio-bar-fill fill-orange" style={{ width: '60%' }}></div></div>
              </div>
              <div className="demo-ratio-item">
                <div className="ratio-info"><span>TikTok Shop</span><span>30%</span></div>
                <div className="ratio-bar-bg"><div className="ratio-bar-fill fill-blue" style={{ width: '30%' }}></div></div>
              </div>
              <div className="demo-ratio-item">
                <div className="ratio-info"><span>Lazada</span><span>10%</span></div>
                <div className="ratio-bar-bg"><div className="ratio-bar-fill fill-green" style={{ width: '10%' }}></div></div>
              </div>
            </div>

            {/* Câu 3 */}
            <div className="demo-question-block" style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', fontSize: '12px', color: 'var(--ink-black)', marginBottom: '8px' }}>Câu 3: Mức chi tiêu hàng tháng?</div>
              <div className="demo-ratio-item">
                <div className="ratio-info"><span>Dưới 1 triệu</span><span>25%</span></div>
                <div className="ratio-bar-bg"><div className="ratio-bar-fill" style={{ width: '25%', background: '#64748b' }}></div></div>
              </div>
              <div className="demo-ratio-item">
                <div className="ratio-info"><span>1 - 3 triệu</span><span>45%</span></div>
                <div className="ratio-bar-bg"><div className="ratio-bar-fill fill-blue" style={{ width: '45%' }}></div></div>
              </div>
              <div className="demo-ratio-item">
                <div className="ratio-info"><span>Trên 3 triệu</span><span>30%</span></div>
                <div className="ratio-bar-bg"><div className="ratio-bar-fill fill-orange" style={{ width: '30%' }}></div></div>
              </div>
            </div>
            
            {/* Câu 4 */}
            <div className="demo-question-block">
              <div style={{ fontWeight: '600', fontSize: '12px', color: 'var(--ink-black)', marginBottom: '8px' }}>Câu 4: Bạn quan tâm yếu tố nào nhất? (Multiple Choice)</div>
              <div className="demo-ratio-item">
                <div className="ratio-info"><span>Giá rẻ / Khuyến mãi</span><span>75%</span></div>
                <div className="ratio-bar-bg"><div className="ratio-bar-fill fill-green" style={{ width: '75%' }}></div></div>
              </div>
              <div className="demo-ratio-item">
                <div className="ratio-info"><span>Freeship</span><span>85%</span></div>
                <div className="ratio-bar-bg"><div className="ratio-bar-fill fill-blue" style={{ width: '85%' }}></div></div>
              </div>
              <div className="demo-ratio-item">
                <div className="ratio-info"><span>Chất lượng sản phẩm</span><span>40%</span></div>
                <div className="ratio-bar-bg"><div className="ratio-bar-fill fill-orange" style={{ width: '40%' }}></div></div>
              </div>
            </div>
            
          </div>
        </div>
        
        {/* Right Column: Monitoring */}
        <div className="demo-col demo-monitor">
          <div className="demo-metrics">
            <div className="demo-metric-box">
              <div className="metric-val text-green">{isRunning ? (98 + Math.random()).toFixed(1) : '99.8'}%</div>
              <div className="metric-lbl">Success Rate</div>
            </div>
            <div className="demo-metric-box">
              <div className="metric-val text-blue">{isRunning ? (1.0 + Math.random()).toFixed(1) : '1.2'}s</div>
              <div className="metric-lbl">Avg Response</div>
            </div>
          </div>
          
          <div className="demo-progress-section">
            <div className="progress-info">
              <span>Tiến độ Auto-Submit</span>
              <span>{currentRequests} / {totalRequests}</span>
            </div>
            <div className="demo-progress-bg">
              <div className="demo-progress-fill" style={{ width: `${progress}%`, transition: 'width 0.5s ease-out' }}></div>
            </div>
          </div>
          
          <div className="demo-mini-logs" ref={logsContainerRef}>
            {logs.length === 0 && <div className="log-line"><span className="log-msg" style={{color: '#888'}}>Waiting to start...</span></div>}
            {logs.map((log, i) => (
              <div key={i} className="log-line fade-in-fast" style={{animation: 'none', opacity: 1}}>
                <span className="log-time">{log.time}</span> 
                <span className={`log-msg ${log.type === 'success' ? 'log-ok' : log.type === 'warn' ? 'log-warn' : ''}`}>{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="demo-web-footer">
        <button className="demo-btn-secondary" onClick={() => setLogs([])} disabled={isRunning}>Clear Logs</button>
        <button className={`demo-btn-primary ${isRunning ? 'btn-danger' : ''}`} onClick={startSimulation} style={isRunning ? {backgroundColor: '#ef4444'} : {}}>
          {isRunning && <span className="demo-spinner"></span>}
          {isRunning ? 'Dừng hệ thống' : 'Bắt đầu chạy'}
        </button>
      </div>
    </div>
  );
}
