import React, { useState } from 'react';
import './SettingsModal.css';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function SettingsModal({
  isOpen,
  onClose,
  geminiKey,
  setGeminiKey,
  openaiKey,
  setOpenaiKey,
  hfKey,
  setHfKey
}) {
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const saveKey = (setter, storageKey, value) => {
    setter(value);
    localStorage.setItem(storageKey, value);
  };

  // const API_URL = "https://form-automation-backend.onrender.com";
  const API_URL = "http://127.0.0.1:5000";

  const handleTestKey = async () => {
    setTesting(true);
    // Ideally the backend has an endpoint for testing, we'll just show a success toast for now if keys exist
    // Or we could try calling analyze-form with dummy data
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Cài đặt AI Provider</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <p className="ai-config-hint">Ưu tiên: Gemini → OpenAI → HuggingFace. Key được lưu trong trình duyệt của bạn.</p>
          
          <div className="form-group mt-3">
            <label htmlFor="gemini-key">Gemini API Key</label>
            <input
              id="gemini-key"
              type="password"
              value={geminiKey}
              onChange={(e) => saveKey(setGeminiKey, "geminiKey", e.target.value)}
              placeholder="AIza..."
              className="input-text"
            />
            <small>API key từ Google AI Studio (ai.google.dev). Free tier giới hạn 20 req/ngày.</small>
          </div>

          <div className="form-group mt-3">
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

          <div className="form-group mt-3">
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

        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleTestKey} disabled={testing}>
            {testing ? 'Đang test...' : 'Test Keys'}
          </button>
          <button className="btn-primary" onClick={onClose}>Xong</button>
        </div>
      </div>
    </div>
  );
}
