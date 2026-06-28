// src/App.js
import React, { useState } from "react";
import "./FormAutomationTool.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiSettings, FiLoader } from "react-icons/fi";

import FormConfigEditor from "./FormConfigEditor";
import SAMPLE_EMAILS from "./sampleEmails";
import TagInput from "../../components/ui/TagInput";
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import axiosClient from '../../services/axiosClient';

const defaultFormConfig = {};

function Tooltip({ text }) {
  // We'll replace this with tippy later if needed, or keep for simple use cases
  return (
    <span className="tooltip-wrap">
      <span className="tooltip-icon">?</span>
      <span className="tooltip-box">{text}</span>
    </span>
  );
}

function FormAutomationTool() {
  const [formUrl, setFormUrl] = useState("");
  const [submitUrl, setSubmitUrl] = useState("");
  const [emails, setEmails] = useState([]);
  const [count, setCount] = useState(1);
  const [maxDelay, setMaxDelay] = useState(4);
  const [formConfig, setFormConfig] = useState(
    JSON.stringify(defaultFormConfig, null, 2)
  );
  const [hiddenFields, setHiddenFields] = useState({});
  const [formRouting, setFormRouting] = useState([]);
  
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { user, refreshWallet } = React.useContext(AuthContext);
  const navigate = useNavigate();
  
  const [aiProvider, setAiProvider] = useState("");

  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem("geminiKey") || "");
  const [openaiKey, setOpenaiKey] = useState(() => localStorage.getItem("openaiKey") || "");
  const [hfKey, setHfKey] = useState(() => localStorage.getItem("hfKey") || "");

  const [useSampleEmails, setUseSampleEmails] = useState(false);

  const fillSampleEmails = () => {
    if (useSampleEmails) {
      // Remove samples
      setEmails(prev => prev.filter(e => !e.isSample));
      setUseSampleEmails(false);
      toast.info("Đã xóa các email mẫu khỏi danh sách!");
    } else {
      // Add samples
      const newSamples = SAMPLE_EMAILS.map(email => ({ value: email, isSample: true }));
      setEmails(prev => {
        const existingValues = new Set(prev.map(p => p.value));
        const added = newSamples.filter(s => !existingValues.has(s.value));
        return [...prev, ...added];
      });
      setUseSampleEmails(true);
      toast.success(`Đã thêm ${SAMPLE_EMAILS.length} email mẫu!`);
    }
  };

  const handleAnalyze = async () => {
    if (!formUrl) {
      toast.error("Vui lòng nhập Form URL trước khi phân tích!");
      return;
    }
    
    setLoadingAnalyze(true);
    setAiProvider("");
    toast.info("Đang phân tích biểu mẫu...", { autoClose: 2000 });
    
    try {
      const response = await axiosClient.post(`/forms/analyze-form`, {
        formUrl,
        geminiKey: geminiKey || undefined,
        openaiKey: openaiKey || undefined,
        hfKey: hfKey || undefined,
      });
      const { submitUrl, formConfig, hiddenFields, formRouting, _provider, questionOrder } = response.data;
      
      let orderedConfig = formConfig;
      if (questionOrder && Array.isArray(questionOrder)) {
        orderedConfig = {};
        questionOrder.forEach(key => {
          if (formConfig[key]) {
            orderedConfig[key] = formConfig[key];
          }
        });
      }
      
      setSubmitUrl(submitUrl);
      setFormConfig(JSON.stringify(orderedConfig, null, 2));
      setHiddenFields(hiddenFields || {});
      setFormRouting(formRouting || []);
      setAiProvider(_provider || "");
      toast.success(`Phân tích hoàn tất! (AI: ${_provider || "Unknown"})`);
    } catch (error) {
      toast.error("Lỗi khi phân tích: " + (error.response?.data?.error || error.message));
    } finally {
      setLoadingAnalyze(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emails.length === 0) {
      toast.warn("Vui lòng nhập ít nhất 1 email!");
      return;
    }
    if (Number(count) <= 0) {
      toast.warn("Số lần gửi phải lớn hơn 0");
      return;
    }
    if (Number(maxDelay) < 0) {
      toast.warn("Thời gian trễ tối đa không hợp lệ");
      return;
    }

    setLoadingSubmit(true);
    setProgress({ current: 0, total: Number(count) });
    toast.info("Đang bắt đầu quá trình gửi...", { autoClose: 2000 });

    try {
      const parsedFormConfig = JSON.parse(formConfig);
      const emailList = emails.map(e => e.value);
      const response = await axiosClient.post(`/forms/fill-form`, {
        formUrl,
        submitUrl,
        emails: emailList,
        count: Number(count),
        maxDelay: Number(maxDelay),
        formConfig: parsedFormConfig,
        hiddenFields: hiddenFields,
        formRouting: formRouting
      });
      
      toast.success(response.data.message || "Đã gửi form thành công!");
      setProgress({ current: response.data.successes || Number(count), total: Number(count) });
      refreshWallet(); // Update wallet balance in UI
    } catch (error) {
      if (error.response?.status === 402) {
         toast.error(error.response.data.error || "Số dư ví không đủ. Vui lòng nạp thêm Credits!");
      } else if (error.response?.status === 401) {
         toast.error("Vui lòng đăng nhập lại để tiếp tục!");
         navigate('/login');
      } else if (error.response?.status === 403) {
         toast.error(error.response.data.error || "Tài khoản của bạn đã bị khóa tính năng này.");
      } else {
         toast.error("Lỗi khi gửi biểu mẫu: " + (error.response?.data?.error || error.message));
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="form-automation-page animate-slide-up">
      <ToastContainer position="bottom-right" theme="colored" />

      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>FORM AUTOMATION</h1>
          <p>Kiến trúc hệ thống mới</p>
        </div>
      </header>

      <main className="automation-content">
        <div className="form-card glass-panel">
          <form onSubmit={handleSubmit} className="form-layout">
            
            <div className="form-group">
              <label htmlFor="formUrl">Google Form URL <Tooltip text="URL trang Google Form. Có thể là trang edit hoặc viewform. Hệ thống sẽ tự phân tích HTML từ link này." /></label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  id="formUrl"
                  type="text"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://docs.google.com/forms/d/e/xxx/viewform"
                  className="input-mc"
                  required
                />
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loadingAnalyze || !formUrl}
                  className="btn-ink"
                  style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {loadingAnalyze ? <><FiLoader className="spin" /> Đang phân tích</> : "Phân tích Form"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="submitUrl">Form Submit URL <Tooltip text="URL submit được tự động điền sau khi phân tích. Không cần chỉnh sửa." /></label>
              <input
                id="submitUrl"
                type="text"
                value={submitUrl}
                readOnly
                className="input-mc read-only"
                placeholder="Tự động điền sau khi phân tích..."
              />
            </div>

            <div className="form-group">
              <label className="label-with-action">
                Danh sách Email <Tooltip text="Nhập email và nhấn Enter/Phẩy. Hệ thống sẽ chọn ngẫu nhiên 1 email cho mỗi lần gửi." />
                <button
                  type="button"
                  className="btn-sample"
                  onClick={fillSampleEmails}
                  title="Tự động điền 400+ email mẫu người Việt"
                  style={{ backgroundColor: useSampleEmails ? '#e6f7ff' : '', borderColor: useSampleEmails ? '#91d5ff' : '' }}
                >
                  📋 {useSampleEmails ? "Xóa data mẫu" : "Dùng data mẫu"}
                </button>
              </label>
              <TagInput 
                tags={emails} 
                setTags={setEmails} 
                placeholder="Nhập email và nhấn Enter..." 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label htmlFor="count">Số lần gửi <Tooltip text="Tổng số lượt điền form sẽ được gửi đi. Mỗi lượt chọn ngẫu nhiên 1 email và 1 đáp án theo tỉ lệ weight." /></label>
                <input
                  id="count"
                  type="number"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  min="1"
                  className="input-mc"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="maxDelay">Thời gian trễ tối đa (giây) <Tooltip text="Giữa mỗi lần gửi, hệ thống chờ ngẫu nhiên từ 0 đến N giây. Giúp tránh bị Google phát hiện spam." /></label>
                <input
                  id="maxDelay"
                  type="number"
                  value={maxDelay}
                  onChange={(e) => setMaxDelay(e.target.value)}
                  min="0"
                  className="input-mc"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Cấu hình Form</label>
              <div className="tip-box routing-tip">
                <b>🔄 Tính năng: Form Routing Engine!</b> Hệ thống tự động nhận diện các nhánh (rẽ trang). Yên tâm điền form, backend sẽ tự động lọc dữ liệu thừa nếu trang đó bị nhảy cóc!
              </div>
              <FormConfigEditor formConfig={formConfig} onChange={setFormConfig} formRouting={formRouting} />
            </div>

            <button
              type="submit"
              disabled={loadingSubmit || !submitUrl}
              className="btn-signal btn-submit"
            >
              {loadingSubmit ? (
                <><FiLoader className="spin" style={{marginRight: '8px'}} /> Đang gửi {progress.current}/{progress.total}</>
              ) : "Bắt đầu Gửi Form"}
            </button>
          </form>
        </div>

        <div>
          <div className="guide-card">
            <h2>Hướng dẫn sử dụng nhanh</h2>
            <ol>
              <li>
                Lấy URL của Google Form bạn muốn điền (đường link kết thúc bằng <b>/viewform</b>).
              </li>
              <li>
                Dán URL vào ô <b>Google Form URL</b> và nhấn <b>Phân tích Form</b>.
              </li>
              <li>
                Đợi hệ thống tải cấu trúc của biểu mẫu. Quá trình này có thể mất chút thời gian tùy thuộc vào độ phức tạp của Form và AI Provider.
              </li>
              <li>
                Tùy chỉnh tỷ lệ (weight) các đáp án ở khung Cấu hình trực quan. 
              </li>
              <li>
                Nhập danh sách Email và thiết lập số lần gửi mong muốn.
              </li>
              <li>Cuối cùng nhấn <b>Bắt đầu Gửi Form</b> để hoàn tất.</li>
            </ol>
            <div className="tip-box warning">
              <b>Lỗi 400 Bad Request:</b> Nếu biểu mẫu có phân nhánh (nhảy qua một trang dựa trên câu trả lời), hãy chú ý set % về 0 đối với các đáp án kết thúc form ngay lập tức nếu bạn muốn script chạy toàn bộ các trang.
            </div>
            <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--white)', margin: 0 }}>Cấu hình Nâng cao</h3>
                {aiProvider ? (
                   <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>AI đang dùng: <b style={{ color: 'var(--white)' }}>{aiProvider}</b></span>
                ) : (
                   <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Bạn có thể thêm API Key để tự động phân tích cấu trúc Form</span>
                )}
              </div>
              <Link to="/settings" className="btn-sample" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: 'var(--white)', color: 'var(--ink-black)' }}>
                <FiSettings size={18} /> Mở Cài đặt
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default FormAutomationTool;
