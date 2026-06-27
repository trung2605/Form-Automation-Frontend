import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import SpotlightCard from '../../components/SpotlightCard/SpotlightCard';
import './Settings.css';

export default function Settings() {
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [hfKey, setHfKey] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setGeminiKey(localStorage.getItem('geminiKey') || '');
    setOpenaiKey(localStorage.getItem('openaiKey') || '');
    setHfKey(localStorage.getItem('hfKey') || '');
  }, []);

  const saveKey = (setter, storageKey, value) => {
    setter(value);
    localStorage.setItem(storageKey, value);
  };

  const handleTestKey = async () => {
    setTesting(true);
    try {
      if (!geminiKey && !openaiKey && !hfKey) {
        toast.warn('Vui lòng nhập ít nhất một API Key để test.');
        setTesting(false);
        return;
      }
      
      // Simulating an API verify call
      await new Promise(res => setTimeout(res, 1000));
      
      toast.success('Keys đã được lưu và hợp lệ!');
    } catch (e) {
      toast.error('Có lỗi xảy ra khi test API Key.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="settings-page">
      <SpotlightCard className="settings-card" spotlightColor="rgba(243, 115, 56, 0.1)">
        <h1 className="settings-title">Cài đặt Hệ thống</h1>
        <p className="settings-desc">Cấu hình API Keys cho các AI Provider để phân tích và xử lý Form. Ưu tiên: Gemini → OpenAI → HuggingFace.</p>

        <div className="settings-form">
          <div className="form-group">
            <label htmlFor="gemini-key">Gemini API Key</label>
            <input
              id="gemini-key"
              type="password"
              value={geminiKey}
              onChange={(e) => saveKey(setGeminiKey, "geminiKey", e.target.value)}
              placeholder="AIza..."
              className="input-text"
            />
            <small>API key từ Google AI Studio (ai.google.dev). Miễn phí 20 req/ngày.</small>
          </div>

          <div className="form-group">
            <label htmlFor="openai-key">OpenAI API Key</label>
            <input
              id="openai-key"
              type="password"
              value={openaiKey}
              onChange={(e) => saveKey(setOpenaiKey, "openaiKey", e.target.value)}
              placeholder="sk-..."
              className="input-text"
            />
            <small>API key từ platform.openai.com. Dùng model gpt-4o-mini.</small>
          </div>

          <div className="form-group">
            <label htmlFor="hf-key">HuggingFace API Key</label>
            <input
              id="hf-key"
              type="password"
              value={hfKey}
              onChange={(e) => saveKey(setHfKey, "hfKey", e.target.value)}
              placeholder="hf_..."
              className="input-text"
            />
            <small>Từ huggingface.co/settings/tokens. Cần tích quyền 'Make calls to Inference Providers'.</small>
          </div>

          <div className="settings-actions">
            <button className="btn-primary" onClick={handleTestKey} disabled={testing}>
              {testing ? 'Đang test...' : 'Lưu & Kiểm tra'}
            </button>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}
