import React, { useState, useContext } from 'react';
import './Summarizer.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../services/axiosClient';
import { AuthContext } from '../../contexts/AuthContext';
import { FiLoader, FiFileText, FiZap, FiList, FiCopy } from 'react-icons/fi';
import { HelpPanel, HelpSteps, HelpTip, FieldHint } from '../../components/ui/HelpPanel';

const MAX_CHARS = 20000;
const LENGTH_OPTIONS = [
  { key: 'short', label: 'Ngắn gọn', desc: '~3 câu' },
  { key: 'medium', label: 'Vừa phải', desc: '~5-7 câu' },
  { key: 'long', label: 'Chi tiết', desc: '~10-12 câu' },
];

function Summarizer() {
  const { refreshWallet } = useContext(AuthContext);
  const [text, setText] = useState('');
  const [length, setLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSummarize = async () => {
    if (text.trim().length < 100) { toast.warn('Văn bản cần tối thiểu 100 ký tự.'); return; }

    setLoading(true);
    setResult(null);
    try {
      const res = await axiosClient.post('/summarizer/summarize', { text, length });
      setResult(res.data);
      toast.success(`Tóm tắt xong! (-${res.data.cost} credit)`);
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

  const copySummary = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.summary);
    toast.success('Đã copy bản tóm tắt!');
  };

  return (
    <div className="sum-page animate-slide-up">
      <ToastContainer position="bottom-right" theme="colored" />

      <div className="sum-hero">
        <div className="sum-hero-badge"><FiFileText /> TEXT SUMMARIZER</div>
        <h1 className="sum-hero-title">Tóm tắt <span className="sum-hero-accent">văn bản</span></h1>
        <p className="sum-hero-desc">
          Rút gọn bài viết dài thành nội dung cốt lõi bằng AI, kèm các điểm chính.
        </p>
      </div>

      <HelpPanel>
        <HelpSteps steps={[
          <>Dán bài viết, báo cáo, hoặc đoạn văn bản dài vào ô nhập (tối thiểu <strong>100 ký tự</strong>, tối đa 20.000 ký tự).</>,
          <>Chọn độ dài mong muốn cho bản tóm tắt: <strong>Ngắn gọn</strong> (~3 câu), <strong>Vừa phải</strong> (~5-7 câu), hoặc <strong>Chi tiết</strong> (~10-12 câu).</>,
          <>Nhấn <strong>"Tóm tắt ngay"</strong> — AI trả về đoạn tóm tắt cùng danh sách các điểm chính (key points) tách riêng.</>,
          <>Dùng nút <strong>Copy</strong> ở góc kết quả để sao chép nhanh bản tóm tắt.</>,
        ]} />
        <HelpTip>
          Tỉ lệ rút gọn hiển thị ở cuối kết quả cho biết bản tóm tắt đã cô đọng bao nhiêu % so với văn bản gốc — hữu ích khi cần đánh giá độ súc tích.
        </HelpTip>
      </HelpPanel>

      <div className="sum-main">
        <div className="sum-field">
          <div className="sum-field-header">
            <label className="sum-label">
              Văn bản cần tóm tắt
              <FieldHint text="Dán nguyên văn bài viết, báo cáo hoặc email dài — AI sẽ tự nhận diện ý chính, không cần chỉnh sửa định dạng trước." />
            </label>
            <span className="sum-charcount">{text.length} / {MAX_CHARS}</span>
          </div>
          <textarea
            className="sum-textarea"
            placeholder="Dán bài viết, báo cáo, hoặc đoạn văn bản dài cần tóm tắt..."
            value={text}
            maxLength={MAX_CHARS}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="sum-field">
          <label className="sum-label">Độ dài bản tóm tắt</label>
          <div className="sum-length-tabs">
            {LENGTH_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={`sum-length-tab ${length === opt.key ? 'active' : ''}`}
                onClick={() => setLength(opt.key)}
              >
                <span className="sum-length-label">{opt.label}</span>
                <span className="sum-length-desc">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="sum-cost-row">
          <FiZap className="sum-cost-icon" />
          <span>Chi phí: <strong>2 credit</strong> / lần tóm tắt</span>
        </div>

        <button className="btn-ink sum-submit" onClick={handleSummarize} disabled={loading}>
          {loading ? <><FiLoader className="spin" /> Đang tóm tắt...</> : <><FiFileText /> Tóm tắt ngay</>}
        </button>
      </div>

      {result && (
        <div className="sum-result">
          <div className="sum-result-header">
            <h3><FiFileText /> Bản tóm tắt</h3>
            <button className="sum-copy-btn" onClick={copySummary}><FiCopy /> Copy</button>
          </div>
          <p className="sum-summary-text">{result.summary}</p>

          {result.key_points && result.key_points.length > 0 && (
            <div className="sum-keypoints">
              <h4><FiList /> Điểm chính</h4>
              <ul>
                {result.key_points.map((point, i) => <li key={i}>{point}</li>)}
              </ul>
            </div>
          )}

          <div className="sum-stats">
            <span>Gốc: {result.original_length} ký tự</span>
            <span>Tóm tắt: {result.summary_length} ký tự</span>
            <span>Rút gọn: {Math.round((1 - result.summary_length / result.original_length) * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Summarizer;
