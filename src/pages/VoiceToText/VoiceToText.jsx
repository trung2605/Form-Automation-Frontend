import React, { useState, useContext, useRef } from 'react';
import './VoiceToText.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../services/axiosClient';
import { AuthContext } from '../../contexts/AuthContext';
import { FiUploadCloud, FiLoader, FiCopy, FiDownload, FiMic, FiFileText } from 'react-icons/fi';

const MODELS = [
  { value: 'tiny', label: 'Tiny (nhanh nhất)' },
  { value: 'base', label: 'Base (cân bằng)' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium (chính xác)' },
  { value: 'large', label: 'Large (tốt nhất)' },
];

const LANGUAGES = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
  { value: 'auto', label: 'Tự động' },
];

function VoiceToText() {
  const { refreshWallet } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [model, setModel] = useState('base');
  const [language, setLanguage] = useState('vi');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('audio/') && !/\.(mp3|wav|m4a|ogg|flac|webm)$/i.test(f.name)) {
      toast.error('Vui lòng chọn file âm thanh hợp lệ.');
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleTranscribe = async () => {
    if (!file) {
      toast.warn('Vui lòng chọn file âm thanh!');
      return;
    }
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('model', model);
    formData.append('language', language);

    try {
      const response = await axiosClient.post('/voice/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
      toast.success(`Chuyển đổi xong! (-${response.data.cost} credits)`);
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

  const copyText = () => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text);
      toast.success('Đã copy văn bản!');
    }
  };

  const download = (content, filename, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="vtt-page animate-slide-up">
      <ToastContainer position="bottom-right" theme="colored" />

      <header className="page-header">
        <h1>VOICE TO TEXT</h1>
        <p>Chuyển âm thanh cuộc họp, phỏng vấn thành văn bản bằng mô hình Whisper</p>
      </header>

      <main className="vtt-content">
        <div className="vtt-card glass-panel">
          {/* Dropzone */}
          <div
            className={`vtt-dropzone ${file ? 'has-file' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac,.webm"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <FiUploadCloud size={42} />
            {file ? (
              <p className="vtt-filename"><FiMic /> {file.name}</p>
            ) : (
              <>
                <p className="vtt-drop-title">Kéo thả file âm thanh vào đây</p>
                <p className="vtt-drop-sub">hoặc bấm để chọn file (mp3, wav, m4a...)</p>
              </>
            )}
          </div>

          {/* Options */}
          <div className="vtt-options">
            <div className="form-group">
              <label>Mô hình</label>
              <select className="input-mc" value={model} onChange={(e) => setModel(e.target.value)}>
                {MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Ngôn ngữ</label>
              <select className="input-mc" value={language} onChange={(e) => setLanguage(e.target.value)}>
                {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <button className="btn-ink vtt-submit" onClick={handleTranscribe} disabled={loading}>
            {loading ? <><FiLoader className="spin" /> Đang xử lý...</> : <><FiFileText /> Chuyển đổi (1 credit / phút)</>}
          </button>
        </div>

        {result && (
          <div className="vtt-result glass-panel">
            <div className="vtt-result-header">
              <h3>Kết quả</h3>
              <span className="vtt-meta">
                {result.language?.toUpperCase()} · {result.duration}s · {result.minutes} phút · -{result.cost} credits
              </span>
            </div>
            <textarea className="input-mc vtt-output" value={result.text} readOnly />
            <div className="vtt-actions">
              <button className="btn-outline" onClick={copyText}><FiCopy /> Copy</button>
              <button className="btn-outline" onClick={() => download(result.text, 'transcript.txt')}>
                <FiDownload /> .txt
              </button>
              <button className="btn-outline" onClick={() => download(result.srt, 'transcript.srt')}>
                <FiDownload /> .srt (phụ đề)
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default VoiceToText;
