import React, { useState, useEffect, useRef, useContext } from 'react';
import './TextToVoice.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../services/axiosClient';
import { AuthContext } from '../../contexts/AuthContext';
import {
  FiLoader, FiPlay, FiDownload, FiVolume2, FiUser, FiZap,
  FiSquare, FiInfo, FiChevronDown, FiChevronUp, FiCheckCircle, FiEdit3,
} from 'react-icons/fi';
import { HelpPanel, HelpSteps, HelpTip, FieldHint } from '../../components/ui/HelpPanel';

const MAX_CHARS = 5000;
const LANG_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'vi',  label: '🇻🇳 Tiếng Việt' },
  { key: 'en',  label: '🇺🇸 English' },
];


const TOOLBAR_TOKENS = [
  { label: 'B', title: '**Nhấn mạnh mạnh**', token: '**text**', style: { fontWeight: 900 } },
  { label: 'I', title: '*Nhấn mạnh*',         token: '*text*',   style: { fontStyle: 'italic' } },
  { label: '…', title: 'Nghỉ ngắn (700ms)',    token: '...' },
  { label: '–',  title: 'Nghỉ nhẹ (400ms)',    token: '--' },
  { label: '⏸', title: 'Nghỉ tùy chỉnh',      token: '(pause:500)' },
  { label: '🐢', title: 'Đọc chậm',            token: '[chậm: text]' },
  { label: '🐇', title: 'Đọc nhanh',           token: '[nhanh: text]' },
  { label: '🤫', title: 'Thì thầm',            token: '[thì thầm: text]' },
];

// Static SSML syntax table (mirrors backend SSML_SYNTAX)
const SSML_SYNTAX = [
  { token: '...',           effect: 'Nghỉ ngắn (700ms)',     example: 'Xin chào... tôi là AI' },
  { token: '--',            effect: 'Nghỉ nhẹ (400ms)',      example: 'Ý 1-- ý 2' },
  { token: '---',           effect: 'Nghỉ vừa (1s)',         example: 'Hết phần 1--- Phần 2' },
  { token: '----',          effect: 'Nghỉ dài (1.5s)',       example: 'Chương 1---- Ngày xưa' },
  { token: '(pause:500)',   effect: 'Nghỉ tùy chỉnh (ms)',   example: '(pause:1200) rồi tiếp' },
  { token: '*text*',        effect: 'Nhấn mạnh vừa',        example: '*quan trọng* lắm' },
  { token: '**text**',      effect: 'Nhấn mạnh mạnh',       example: '**cảnh báo** nguy hiểm' },
  { token: '[chậm: text]',  effect: 'Đọc chậm đoạn đó',    example: '[chậm: đọc kỹ phần này]' },
  { token: '[nhanh: text]', effect: 'Đọc nhanh đoạn đó',   example: '[nhanh: thông tin phụ]' },
  { token: '[thì thầm: text]', effect: 'Giọng thì thầm',   example: '[thì thầm: bí mật nha]' },
];

function TextToVoice() {
  const { refreshWallet } = useContext(AuthContext);
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [voiceId, setVoiceId] = useState('');
  const [speed, setSpeed] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioFormat, setAudioFormat] = useState('mp3');
  const [ssmlUsed, setSsmlUsed] = useState(false);
  const [langTab, setLangTab] = useState('all');
  const [syntaxOpen, setSyntaxOpen] = useState(false);

  const [previewingId, setPreviewingId] = useState(null);
  const previewAudioRef = useRef(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [demoSamples, setDemoSamples] = useState({});   // { vi: content, en: content }
  const [aiPrompts, setAiPrompts] = useState([]);

  const copyPrompt = (p) => {
    navigator.clipboard.writeText(p.content).then(() => {
      setCopiedId(p.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  useEffect(() => {
    // Load voices
    axiosClient.get('/tts/voices')
      .then((res) => {
        const list = res.data.voices || [];
        setVoices(list);
        if (list.length) setVoiceId(list[0].id);
      })
      .catch(() => toast.error('Không tải được danh sách giọng nói.'));
  }, []);

  useEffect(() => {
    // Load sample texts
    axiosClient.get('/tts/samples?category=demo')
      .then((res) => {
        const map = {};
        (res.data.samples || []).forEach(s => { map[s.language] = s.content; });
        setDemoSamples(map);
      })
      .catch(() => {});
    // Load AI prompts
    axiosClient.get('/tts/samples?category=prompt')
      .then((res) => setAiPrompts(res.data.samples || []))
      .catch(() => {});
  }, []);

  const handlePreview = async (e, vid) => {
    e.stopPropagation();
    if (previewingId === vid) {
      if (previewAudioRef.current) { previewAudioRef.current.pause(); previewAudioRef.current = null; }
      setPreviewingId(null);
      return;
    }
    if (previewAudioRef.current) { previewAudioRef.current.pause(); previewAudioRef.current = null; }
    setPreviewingId(vid);
    try {
      const res = await axiosClient.get(`/tts/preview/${vid}`);
      const { audio, format = 'mp3' } = res.data;
      const el = new Audio(`data:audio/${format};base64,${audio}`);
      previewAudioRef.current = el;
      el.play();
      el.onended = () => { setPreviewingId(null); previewAudioRef.current = null; };
      el.onerror = () => { setPreviewingId(null); previewAudioRef.current = null; };
    } catch {
      toast.error('Không thể phát thử giọng nói.');
      setPreviewingId(null);
    }
  };

  const insertToken = (token) => {
    const ta = document.getElementById('ttv-textarea');
    if (!ta) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const selected = text.slice(start, end);

    let insertion = token;
    // Tokens with "text" placeholder — wrap selection or insert placeholder
    if (token.includes('text')) {
      const inner = selected || 'văn bản';
      insertion = token.replace('text', inner);
    } else if (selected) {
      insertion = selected + token;
    }

    const newText = text.slice(0, start) + insertion + text.slice(end);
    setText(newText);
    // Restore focus + cursor after state update
    setTimeout(() => {
      ta.focus();
      const pos = start + insertion.length;
      ta.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleSynthesize = async () => {
    if (!text.trim()) { toast.warn('Vui lòng nhập văn bản!'); return; }
    if (!voiceId)     { toast.warn('Vui lòng chọn giọng nói!'); return; }
    setLoading(true);
    setAudioUrl(null);
    try {
      const res = await axiosClient.post('/tts/synthesize', {
        text, voice_id: voiceId, speed: parseFloat(speed),
      });
      const { audio, format = 'mp3', cost, ssml_used } = res.data;
      setAudioFormat(format);
      setAudioUrl(`data:audio/${format};base64,${audio}`);
      setSsmlUsed(!!ssml_used);
      toast.success(`Tổng hợp xong! (-${cost} credits)`);
      refreshWallet();
    } catch (error) {
      if (error.response?.status === 402) {
        toast.error('Số dư không đủ. Vui lòng nạp thêm Credits!');
      } else {
        toast.error('Lỗi: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `voice.${audioFormat}`;
    a.click();
  };

  const estCost = Math.max(1, Math.ceil(text.length / 200));
  const selectedVoice = voices.find(v => v.id === voiceId);
  const filteredVoices = langTab === 'all' ? voices : voices.filter(v => v.language === langTab);

  return (
    <div className="ttv-page animate-slide-up">
      <ToastContainer position="bottom-right" theme="colored" />

      {/* Hero */}
      <div className="ttv-hero">
        <div className="ttv-hero-badge"><FiVolume2 /> AI Voice Synthesis</div>
        <h1 className="ttv-hero-title">Text <span className="ttv-hero-accent">to</span> Voice</h1>
        <p className="ttv-hero-desc">
          Tổng hợp giọng nói tự nhiên với {voices.length} giọng đọc — hỗ trợ ngắt nghỉ &amp; nhấn mạnh thông minh
        </p>
      </div>

      <HelpPanel>
        <HelpSteps steps={[
          <>Chọn giọng đọc ở sidebar trái — lọc theo ngôn ngữ (Tất cả / Tiếng Việt / English), bấm nút <strong>"Thử"</strong> để nghe mẫu trước khi dùng.</>,
          <>Nhập văn bản cần đọc, hoặc bấm <strong>"Dùng văn bản mẫu"</strong> để xem ví dụ có sẵn kèm đầy đủ ký hiệu điều khiển.</>,
          <>(Tùy chọn) Bấm mở panel <strong>"Ký hiệu điều khiển giọng đọc"</strong> bên dưới để chèn nhanh dấu ngắt nghỉ, nhấn mạnh — bôi đen chữ trước khi bấm ký hiệu để bọc quanh đoạn đó.</>,
          <>Chỉnh <strong>Tốc độ giọng nói</strong> bằng thanh trượt (0.5× chậm nhất — 2.0× nhanh nhất).</>,
          <>Nhấn <strong>"Tạo giọng nói"</strong> — nghe thử ngay trên trình phát, tải file MP3 nếu ưng ý.</>,
        ]} />
        <HelpTip>
          Không biết viết văn bản sao cho tự nhiên? Mở panel <strong>"Tạo văn bản bằng AI"</strong> phía trên để copy sẵn prompt mẫu, dán vào ChatGPT/Gemini/Claude rồi dán kết quả ngược lại vào đây.
        </HelpTip>
      </HelpPanel>

      {/* 2-column layout */}
      <div className="ttv-layout">

        {/* LEFT sidebar */}
        <aside className="ttv-sidebar">
          <div className="ttv-section-label">Nhân vật / Giọng nói</div>

          <div className="ttv-lang-tabs">
            {LANG_TABS.map(tab => (
              <button key={tab.key}
                className={`ttv-lang-tab ${langTab === tab.key ? 'active' : ''}`}
                onClick={() => setLangTab(tab.key)}
              >{tab.label}</button>
            ))}
          </div>

          <div className="ttv-voice-list">
            {filteredVoices.map((v) => (
              <div key={v.id}
                className={`ttv-voice-item ${voiceId === v.id ? 'active' : ''}`}
                onClick={() => setVoiceId(v.id)}
              >
                <div className="ttv-voice-avatar"><FiUser /></div>
                <div className="ttv-voice-info">
                  <span className="ttv-voice-name">{v.name}</span>
                  <span className="ttv-voice-desc">{v.description}</span>
                </div>
                <div className="ttv-voice-actions">
                  <span className={`ttv-lang-badge ttv-lang-${v.gender}`}>
                    {v.language.toUpperCase()}
                  </span>
                  <button
                    className={`ttv-preview-btn ${previewingId === v.id ? 'playing' : ''}`}
                    onClick={(e) => handlePreview(e, v.id)}
                    title="Nghe thử"
                  >
                    {previewingId === v.id ? <><FiSquare /> Dừng</> : <><FiPlay /> Thử</>}
                  </button>
                </div>
              </div>
            ))}
            {filteredVoices.length === 0 && (
              <p className="ttv-no-voices">Không có giọng nào.</p>
            )}
          </div>

          {selectedVoice && (
            <div className="ttv-voice-summary">
              <div className="ttv-voice-summary-row">
                <span>Đang chọn</span>
                <strong>{selectedVoice.name}</strong>
              </div>
              <div className="ttv-voice-summary-row">
                <span>Ngôn ngữ</span>
                <strong>{selectedVoice.language === 'vi' ? '🇻🇳 Tiếng Việt' : '🇺🇸 English'}</strong>
              </div>
              <div className="ttv-voice-summary-row">
                <span>Giới tính</span>
                <strong>{selectedVoice.gender === 'female' ? '👩 Nữ' : '👨 Nam'}</strong>
              </div>
            </div>
          )}
        </aside>

        {/* RIGHT main panel */}
        <div className="ttv-main">

          {/* AI Prompt Generator */}
          <div className="ttv-prompt-panel">
            <button className="ttv-syntax-toggle ttv-prompt-toggle" onClick={() => setPromptOpen(o => !o)}>
              <span className="ttv-prompt-toggle-icon">✨</span>
              Tạo văn bản bằng AI (ChatGPT / Gemini / Claude...)
              {promptOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            {promptOpen && (
              <div className="ttv-prompt-body">
                <p className="ttv-prompt-intro">
                  Copy prompt bên dưới → dán vào AI bạn đang dùng → lấy kết quả dán vào ô văn bản để tạo giọng đọc.
                </p>
                <div className="ttv-prompt-grid">
                  {aiPrompts.map((p) => (
                    <div key={p.id} className="ttv-prompt-card">
                      <div className="ttv-prompt-card-header">
                        <div>
                          <div className="ttv-prompt-card-label">{p.label}</div>
                          <div className="ttv-prompt-card-desc">{p.description}</div>
                        </div>
                        <button
                          className={`ttv-prompt-copy ${copiedId === p.id ? 'copied' : ''}`}
                          onClick={() => copyPrompt(p)}
                        >
                          {copiedId === p.id ? '✓ Đã copy' : '📋 Copy prompt'}
                        </button>
                      </div>
                      <pre className="ttv-prompt-preview">{p.content}</pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SSML syntax guide */}
          <div className="ttv-syntax-panel">
            <button className="ttv-syntax-toggle" onClick={() => setSyntaxOpen(o => !o)}>
              <FiInfo /> Ký hiệu điều khiển giọng đọc
              {syntaxOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            {syntaxOpen && (
              <div className="ttv-syntax-body">
                <div className="ttv-syntax-grid">
                  {SSML_SYNTAX.map((s) => (
                    <div key={s.token} className="ttv-syntax-row">
                      <button
                        className="ttv-syntax-token"
                        onClick={() => insertToken(s.token)}
                        title="Click để chèn vào văn bản"
                      >
                        {s.token}
                      </button>
                      <span className="ttv-syntax-effect">{s.effect}</span>
                      <span className="ttv-syntax-example">{s.example}</span>
                    </div>
                  ))}
                </div>
                <p className="ttv-syntax-hint">
                  💡 Click vào ký hiệu để chèn vào vị trí con trỏ. Bôi đen text trước khi click để bọc.
                </p>
              </div>
            )}
          </div>

          {/* Text input */}
          <div className="ttv-field">
            <div className="ttv-field-header">
              <label className="ttv-label">Nội dung văn bản</label>
              <div className="ttv-field-actions">
                <button
                  className="ttv-sample-btn"
                  onClick={() => {
                    const lang = selectedVoice?.language || 'vi';
                    const content = demoSamples[lang] || demoSamples['vi'] || '';
                    if (content) setText(content);
                  }}
                  title="Điền văn bản mẫu để thử giọng"
                >
                  <FiEdit3 /> Dùng văn bản mẫu
                </button>
                <span className="ttv-charcount">{text.length} / {MAX_CHARS}</span>
              </div>
            </div>

            {/* Toolbar */}
            <div className="ttv-toolbar">
              {TOOLBAR_TOKENS.map((t) => (
                <button
                  key={t.token}
                  className="ttv-toolbar-btn"
                  style={t.style}
                  title={t.title}
                  onClick={() => insertToken(t.token)}
                >
                  {t.label}
                </button>
              ))}
              <span className="ttv-toolbar-sep" />
              <button
                className="ttv-toolbar-btn ttv-toolbar-clear"
                title="Xóa toàn bộ văn bản"
                onClick={() => setText('')}
              >✕</button>
            </div>

            <textarea
              id="ttv-textarea"
              className="ttv-textarea"
              placeholder={`Nhập văn bản hoặc nhấn "Dùng văn bản mẫu" để thử...\n\nVí dụ:\nXin chào... tôi là *trợ lý AI* của bạn.\n[chậm: Hôm nay chúng ta sẽ học về] **lập trình**.`}
              value={text}
              maxLength={MAX_CHARS}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {/* Speed */}
          <div className="ttv-field">
            <div className="ttv-field-header">
              <label className="ttv-label">
                Tốc độ giọng nói
                <FieldHint text="1.0× là tốc độ tự nhiên mặc định. Giảm xuống nếu cần đọc rõ ràng, chậm rãi; tăng lên để rút ngắn thời lượng audio." />
              </label>
              <span className="ttv-speed-val">{parseFloat(speed).toFixed(1)}×</span>
            </div>
            <div className="ttv-slider-track">
              <span className="ttv-slider-hint">Chậm</span>
              <input type="range" min="0.5" max="2.0" step="0.1"
                value={speed} onChange={(e) => setSpeed(e.target.value)}
                className="ttv-slider"
              />
              <span className="ttv-slider-hint">Nhanh</span>
            </div>
          </div>

          {/* Cost row */}
          <div className="ttv-cost-row">
            <FiZap className="ttv-cost-icon" />
            <span>Ước tính: <strong>{estCost} credit{estCost > 1 ? 's' : ''}</strong></span>
            <span className="ttv-engine-badge">⚡ Edge TTS</span>
          </div>

          {/* Submit */}
          <button className="btn-ink ttv-submit" onClick={handleSynthesize}
            disabled={loading || !text.trim()}>
            {loading
              ? <><FiLoader className="spin" /> Đang tổng hợp...</>
              : <><FiVolume2 /> Tạo giọng nói ({estCost} credits)</>
            }
          </button>

          {/* Result */}
          {audioUrl && (
            <div className="ttv-result">
              <div className="ttv-result-label">
                <FiPlay /> Kết quả — {selectedVoice?.name}
                {ssmlUsed && (
                  <span className="ttv-ssml-badge"><FiCheckCircle /> SSML</span>
                )}
              </div>
              <audio controls src={audioUrl} className="ttv-audio" />
              <button className="btn-outline ttv-download" onClick={download}>
                <FiDownload /> Tải file .{audioFormat}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TextToVoice;
