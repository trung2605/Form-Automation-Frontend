// src/App.js
import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import imgStep1 from "./assets/step1.png";
import imgStep2 from "./assets/step2.png";
import imgStep3 from "./assets/step3.png";
import FormConfigEditor from "./FormConfigEditor";

const defaultFormConfig = {
  "entry.1921726016": { type: "email" },
  "entry.23471524": {
    type: "choice",
    options: ["Xanh", "Đỏ", "Vàng"],
    weights: [0.4, 0.3, 0.3],
  },
  "entry.444768150": {
    type: "choice",
    options: ["Mì", "Bún", "Phở"],
    weights: [0.5, 0.3, 0.2],
  },
};

function Tooltip({ text }) {
  return (
    <span className="tooltip-wrap">
      <span className="tooltip-icon">?</span>
      <span className="tooltip-box">{text}</span>
    </span>
  );
}

function App() {
  const [htmlSource, setHtmlSource] = useState("");
  const [submitUrl, setSubmitUrl] = useState("");
  const [emails, setEmails] = useState("");
  const [count, setCount] = useState(1);
  const [maxDelay, setMaxDelay] = useState(4);
  const [formConfig, setFormConfig] = useState(
    JSON.stringify(defaultFormConfig, null, 2)
  );
  const [status, setStatus] = useState("");
  const [hiddenFields, setHiddenFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [viewformUrl, setViewformUrl] = useState("");
  const [aiProvider, setAiProvider] = useState("");

  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem("geminiKey") || "");
  const [openaiKey, setOpenaiKey] = useState(() => localStorage.getItem("openaiKey") || "");
  const [hfKey, setHfKey] = useState(() => localStorage.getItem("hfKey") || "");

  const saveKey = (setter, storageKey, value) => {
    setter(value);
    localStorage.setItem(storageKey, value);
  };

  // const API_URL = "https://form-automation-backend.onrender.com";
  const API_URL = "http://127.0.0.1:5000";


  const handleAnalyze = async () => {
    setLoading(true);
    setAiProvider("");
    setStatus("Đang phân tích mã nguồn HTML...");
    try {
      const response = await axios.post(`${API_URL}/api/analyze-form`, {
        htmlSource,
        geminiKey: geminiKey || undefined,
        openaiKey: openaiKey || undefined,
        hfKey: hfKey || undefined,
      });
      const { submitUrl, formConfig, hiddenFields, _provider } = response.data;
      setSubmitUrl(submitUrl);
      setFormConfig(JSON.stringify(formConfig, null, 2));
      setHiddenFields(hiddenFields || {});
      setAiProvider(_provider || "");
      setStatus(`Phân tích hoàn tất! (dùng ${_provider || "AI"}) Cấu hình biểu mẫu đã được điền.`);
    } catch (error) {
      setStatus(
        "Lỗi khi phân tích biểu mẫu: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("Đang gửi biểu mẫu...");
    try {
      const emailList = emails
        .split(",")
        .map((email) => email.trim())
        .filter((e) => e);
      const parsedFormConfig = JSON.parse(formConfig);
      const response = await axios.post(`${API_URL}/api/fill-form`, {
        formUrl: viewformUrl, // Giữ nguyên URL này
        submitUrl,
        emails: emailList,
        count: Number(count),
        maxDelay: Number(maxDelay),
        formConfig: parsedFormConfig,
        hiddenFields: hiddenFields
      });
      setStatus(response.data.message);
    } catch (error) {
      setStatus(
        "Lỗi khi gửi biểu mẫu: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>FORM AUTOMATION</h1>
        <p>Created by Lê Trí Trung</p>
      </header>
      <main className="app-main two-column-layout">
        {/* Cột trái: Ứng dụng */}
        <div className="left-col">
          <form onSubmit={handleSubmit} className="form-layout">
            <div className="ai-config-section">
              <div className="ai-config-header">
                <span className="ai-config-title">Cấu hình AI</span>
                {aiProvider && (
                  <span className="ai-provider-badge">Đang dùng: {aiProvider}</span>
                )}
              </div>
              <div className="ai-config-grid">
                <div className="form-group">
                  <label>Gemini API Key <Tooltip text="API key từ Google AI Studio (ai.google.dev). Ưu tiên số 1. Free tier giới hạn 20 req/ngày." /></label>
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => saveKey(setGeminiKey, "geminiKey", e.target.value)}
                    placeholder="AIza..."
                    className="input-text"
                  />
                </div>
                <div className="form-group">
                  <label>OpenAI API Key <Tooltip text="API key từ platform.openai.com. Ưu tiên số 2 nếu không có Gemini key. Dùng model gpt-4o-mini." /></label>
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => saveKey(setOpenaiKey, "openaiKey", e.target.value)}
                    placeholder="sk-..."
                    className="input-text"
                  />
                </div>
                <div className="form-group">
                  <label>HuggingFace API Key <Tooltip text="API key từ huggingface.co/settings/tokens. Ưu tiên số 3. Cần tích quyền 'Make calls to Inference Providers'." /></label>
                  <input
                    type="password"
                    value={hfKey}
                    onChange={(e) => saveKey(setHfKey, "hfKey", e.target.value)}
                    placeholder="hf_..."
                    className="input-text"
                  />
                </div>
              </div>
              <p className="ai-config-hint">Ưu tiên: Gemini → OpenAI → HuggingFace. Key được lưu trong trình duyệt.</p>
            </div>

            <div className="form-group">
              <label>Mã nguồn HTML của View Form <Tooltip text="Mở Google Form → Ctrl+U để xem nguồn trang → Ctrl+A rồi Ctrl+C để sao chép toàn bộ → Dán vào đây." /></label>
              <textarea
                value={htmlSource}
                onChange={(e) => setHtmlSource(e.target.value)}
                placeholder="Dán toàn bộ mã nguồn trang tại đây..."
                className="input-textarea"
              />

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className="btn-primary btn-analyze"
              >
                {loading && status.includes("Phân tích")
                  ? "Đang phân tích..."
                  : "Phân tích Form"}
              </button>

              <p>Thời gian thực hiện khá lâu, vui lòng chờ...</p>
            </div>

            <div className="form-group">
              <label>View Form URL <Tooltip text="URL trang xem form, kết thúc bằng /viewform. Ví dụ: https://docs.google.com/forms/d/e/xxx/viewform" /></label>
              <input
                type="text"
                value={viewformUrl}
                onChange={(e) => setViewformUrl(e.target.value)}
                placeholder="Nhập URL của View Form tại đây..."
                className="input-text"
                required
              />
            </div>

            <div className="form-group">
              <label>Form Submit URL <Tooltip text="URL submit được tự động điền sau khi phân tích. Không cần chỉnh sửa." /></label>
              <input
                type="text"
                value={submitUrl}
                readOnly
                className="input-text read-only"
              />
            </div>

            <div className="form-group">
              <label>Danh sách Email <Tooltip text="Nhập các email cách nhau bởi dấu phẩy. Hệ thống sẽ chọn ngẫu nhiên 1 email cho mỗi lần gửi. Ví dụ: a@gmail.com, b@gmail.com" /></label>
              <textarea
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                className="input-textarea"
                rows="4"
                placeholder="vd: user1@gmail.com, user2@gmail.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Số lần gửi <Tooltip text="Tổng số lượt điền form sẽ được gửi đi. Mỗi lượt chọn ngẫu nhiên 1 email và 1 đáp án theo tỉ lệ weight." /></label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                min="1"
                className="input-text"
                required
              />
            </div>

            <div className="form-group">
              <label>Thời gian trễ tối đa <Tooltip text="Giữa mỗi lần gửi, hệ thống chờ ngẫu nhiên từ 0 đến N giây. Giúp tránh bị Google phát hiện spam. Khuyến nghị: 3-10 giây." /></label>
              <input
                type="number"
                value={maxDelay}
                onChange={(e) => setMaxDelay(e.target.value)}
                min="0"
                className="input-text"
                required
              />
            </div>

            <div className="form-group">
              <label>Cấu hình Form</label>
              <FormConfigEditor formConfig={formConfig} onChange={setFormConfig} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-submit"
            >
              {loading && status.includes("gửi") ? "Đang gửi..." : "Gửi Form"}
            </button>
          </form>
          {status && (
            <div className="status-box">
              <p>
                <strong>Trạng thái:</strong> {status}
              </p>
            </div>
          )}
        </div>
        {/* Cột phải: Hướng dẫn */}
        <div className="right-col">
          <div className="guide-box">
            <h2>Hướng dẫn lấy mã nguồn HTML Google Form</h2>
            <ol>
              <li>
                Mở Google Form bạn muốn tự động điền trên trình duyệt Chrome
                hoặc Edge.
              </li>
              <li>
                Nhấn chuột phải vào bất kỳ vị trí trống nào trên trang, chọn{" "}
                <b>"Xem nguồn trang"</b> (View page source) hoặc nhấn tổ hợp
                phím <b>Ctrl+U</b>.
              </li>
              <img
                src={imgStep1}
                className="img-example"
                alt="View Page Source Example"
              />
              <li>Một tab mới sẽ mở ra hiển thị mã nguồn HTML của trang.</li>
              <li>
                Nhấn <b>Ctrl+A</b> để chọn toàn bộ, sau đó <b>Ctrl+C</b> để sao
                chép.
              </li>
              <img
                src={imgStep2}
                className="img-example"
                alt="Copy Page Source Example"
              />
              <li>
                Quay lại ứng dụng này, dán vào ô{" "}
                <b>"Mã nguồn HTML của View Form"</b> phía bên trái.
              </li>
              <li>
                Nhập URL của View Form vào ô <b>"View Form URL"</b> (ví dụ:
                https://docs.google.com/forms/...).
              </li>
              <li>
                Nhấn <b>Phân tích Form</b> để hệ thống tự động nhận diện cấu
                trúc biểu mẫu.
              </li>
              <li>
                Bạn có thể tùy chỉnh tỉ lệ đáp án trong phần <b>"weights"</b>{" "}
                (JSON).
              </li>
              <li>Lưu ý: Tổng tỉ lệ phải bằng 1</li>
              <li>Ví dụ: "weights": [ 0.4, 0.3, 0.3 ]</li>
              <img
                src={imgStep3}
                className="img-example"
                alt="Copy Page Source Example"
              />
              <li>
                Nhập danh sách email (cách nhau bởi dấu phẩy) và số lần gửi.
              </li>
              <li>Cuối cùng nhấn <b>Gửi Form</b> để hoàn tất.</li>
            </ol>
            <div className="tip-box">
              <b>Lưu ý:</b> Không dùng mã nguồn của trang "Xem trước" (Preview),
              hãy dùng đúng trang View Form thực tế.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
