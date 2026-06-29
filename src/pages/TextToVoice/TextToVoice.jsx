import React, { useState, useEffect, useContext } from 'react';
import './TextToVoice.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../services/axiosClient';
import { AuthContext } from '../../contexts/AuthContext';
import { FiLoader, FiPlay, FiDownload, FiVolume2, FiUser } from 'react-icons/fi';

const MAX_CHARS = 5000;

function TextToVoice() {
  const { refreshWallet } = useContext(AuthContext);
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [voiceId, setVoiceId] = useState('');
  const [speed, setSpeed] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [mode, setMode] = useState(null);

  useEffect(() => {
    axiosClient.get('/tts/voices')
      .then((res) => {
        const list = res.data.voices || [];
        setVoices(list);
        if (list.length) setVoiceId(list[0].id);
      })
      .catch(() => toast.error('Không tải được danh sách giọng nói.'));
  }, []);

  const handleSynthesize = async () => {
    if (!text.trim()) {
      toast.warn('Vui lòng nhập văn bản!');
      return;
    }
    if (!voiceId) {
      toast.warn('Vui lòng chọn giọng nói!');
      return;
    }
    setLoading(true);
    setAudioUrl(null);

    try {
      const res = await axiosClient.post('/tts/synthesize', {
        text,
        voice_id: voiceId,
        speed: parseFloat(speed),
      });
      const { audio, format, cost, mode: respMode } = res.data;
      const url = `data:audio/${format};base64,${audio}`;
      setAudioUrl(url);
      setMode(respMode);
      if (respMode === 'mock') {
        toast.info('Đang chạy chế độ MOCK (GPT-SoVITS chưa kết nối) — âm thanh là mẫu trống.');
      } else {
        toast.success(`Tổng hợp xong! (-${cost} credits)`);
      }
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
    a.download = 'voice.wav';
    a.click();
  };

  const estCost = Math.max(1, Math.ceil(text.length / 200));

  return (
    <div className="ttv-page animate-slide-up">
      <ToastContainer position="bottom-right" theme="colored" />

      <header className="page-header">
        <h1>TEXT TO VOICE</h1>
        <p>Tổng hợp giọng nói tự nhiên tiếng Việt với nhiều nhân vật bằng GPT-SoVITS</p>
      </header>

      <main className="ttv-content">
        <div className="ttv-card glass-panel">
          {/* Voice picker */}
          <div className="form-group">
            <label>Chọn nhân vật / giọng nói</label>
            <div className="ttv-voice-grid">
              {voices.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={`ttv-voice-card ${voiceId === v.id ? 'active' : ''}`}
                  onClick={() => setVoiceId(v.id)}
                >
                  <div className="ttv-voice-icon"><FiUser /></div>
                  <div className="ttv-voice-info">
                    <span className="ttv-voice-name">{v.name}</span>
                    <span className="ttv-voice-desc">{v.description}</span>
                  </div>
                  <span className={`ttv-badge ${v.gender}`}>{v.language.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text */}
          <div className="form-group">
            <label>Nội dung văn bản</label>
            <textarea
              className="input-mc ttv-textarea"
              placeholder="Nhập văn bản cần chuyển thành giọng nói..."
              value={text}
              maxLength={MAX_CHARS}
              onChange={(e) => setText(e.target.value)}
            />
            <span className="ttv-charcount">{text.length} / {MAX_CHARS} ký tự</span>
          </div>

          {/* Speed */}
          <div className="form-group">
            <label>Tốc độ: {speed}x</label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              className="ttv-slider"
            />
          </div>

          <button className="btn-ink ttv-submit" onClick={handleSynthesize} disabled={loading}>
            {loading ? <><FiLoader className="spin" /> Đang tổng hợp...</> : <><FiVolume2 /> Tạo giọng nói ({estCost} credits)</>}
          </button>
        </div>

        {audioUrl && (
          <div className="ttv-result glass-panel">
            <div className="ttv-result-header">
              <h3><FiPlay /> Kết quả{mode === 'mock' ? ' (MOCK)' : ''}</h3>
            </div>
            <audio controls src={audioUrl} className="ttv-audio" />
            <button className="btn-outline" onClick={download}><FiDownload /> Tải file .wav</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default TextToVoice;
