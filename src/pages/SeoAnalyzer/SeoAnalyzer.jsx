import React, { useState, useContext } from 'react';
import './SeoAnalyzer.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../services/axiosClient';
import { AuthContext } from '../../contexts/AuthContext';
import {
  FiLoader, FiTrendingUp, FiZap, FiLink, FiFileText, FiTarget,
  FiCheckCircle, FiAlertTriangle, FiXCircle,
} from 'react-icons/fi';
import { HelpPanel, HelpSteps, HelpTip, HelpWarning, FieldHint } from '../../components/ui/HelpPanel';

const MAX_CHARS = 20000;

const ASSESSMENT_META = {
  missing: { label: 'Chưa xuất hiện', icon: <FiXCircle />, cls: 'bad' },
  low:     { label: 'Mật độ thấp',    icon: <FiAlertTriangle />, cls: 'warn' },
  good:    { label: 'Mật độ tốt',     icon: <FiCheckCircle />, cls: 'good' },
  stuffed: { label: 'Nhồi nhét từ khóa', icon: <FiAlertTriangle />, cls: 'bad' },
};

function SeoAnalyzer() {
  const { refreshWallet } = useContext(AuthContext);
  const [inputMode, setInputMode] = useState('text'); // 'text' | 'url'
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (inputMode === 'text' && !text.trim()) { toast.warn('Vui lòng nhập văn bản.'); return; }
    if (inputMode === 'url' && !url.trim()) { toast.warn('Vui lòng nhập URL.'); return; }

    setLoading(true);
    setResult(null);
    try {
      const body = inputMode === 'text'
        ? { text, target_keyword: targetKeyword.trim() || undefined }
        : { url, target_keyword: targetKeyword.trim() || undefined };
      const res = await axiosClient.post('/seo/analyze', body);
      setResult(res.data);
      toast.success(`Phân tích xong! (-${res.data.cost} credit)`);
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

  return (
    <div className="seo-page animate-slide-up">
      <ToastContainer position="bottom-right" theme="colored" />

      <div className="seo-hero">
        <div className="seo-hero-badge"><FiTrendingUp /> SEO ANALYZER</div>
        <h1 className="seo-hero-title">Phân tích <span className="seo-hero-accent">từ khóa</span></h1>
        <p className="seo-hero-desc">
          Kiểm tra mật độ từ khóa, tối ưu on-page SEO từ văn bản hoặc URL bài viết.
        </p>
      </div>

      <HelpPanel>
        <HelpSteps steps={[
          <>Chọn cách nhập nội dung: <strong>Dán văn bản</strong> (copy trực tiếp bài viết) hoặc <strong>Nhập URL</strong> (hệ thống tự tải nội dung từ link).</>,
          <>(Không bắt buộc) Nhập <strong>Target keyword</strong> — từ khóa chính bạn muốn kiểm tra mật độ, ví dụ tên sản phẩm/dịch vụ bạn đang SEO.</>,
          <>Nhấn <strong>"Phân tích ngay"</strong> — hệ thống trả về thống kê từ khóa, độ dài câu, và đánh giá mật độ target keyword.</>,
          <>Xem bảng <strong>Top từ khóa</strong> và <strong>Top cụm 2 từ</strong> để biết bài viết đang tự nhiên lặp từ gì nhiều nhất — dùng để phát hiện từ khóa phụ tiềm năng.</>,
        ]} />
        <HelpTip>
          Mật độ target keyword chuẩn SEO nằm trong khoảng <strong>0.5% – 3%</strong>. Dưới 0.5% Google khó nhận diện chủ đề bài viết; trên 3% có nguy cơ bị đánh giá là nhồi nhét từ khóa (keyword stuffing), ảnh hưởng xấu tới thứ hạng.
        </HelpTip>
        <HelpWarning>
          Chế độ nhập URL cần trang web công khai, không yêu cầu đăng nhập. Trang có chặn bot (Cloudflare, captcha) có thể không tải được nội dung.
        </HelpWarning>
      </HelpPanel>

      <div className="seo-main">
        <div className="seo-input-tabs">
          <button className={`seo-tab ${inputMode === 'text' ? 'active' : ''}`} onClick={() => setInputMode('text')}>
            <FiFileText /> Dán văn bản
          </button>
          <button className={`seo-tab ${inputMode === 'url' ? 'active' : ''}`} onClick={() => setInputMode('url')}>
            <FiLink /> Nhập URL
          </button>
        </div>

        {inputMode === 'text' ? (
          <div className="seo-field">
            <div className="seo-field-header">
              <label className="seo-label">Nội dung bài viết</label>
              <span className="seo-charcount">{text.length} / {MAX_CHARS}</span>
            </div>
            <textarea
              className="seo-textarea"
              placeholder="Dán nội dung bài viết cần phân tích..."
              value={text}
              maxLength={MAX_CHARS}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        ) : (
          <div className="seo-field">
            <label className="seo-label">URL bài viết</label>
            <input
              className="seo-input"
              type="text"
              placeholder="https://example.com/bai-viet"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        )}

        <div className="seo-field">
          <label className="seo-label">
            Target keyword (không bắt buộc)
            <FieldHint text="Từ khóa chính bạn muốn kiểm tra mật độ xuất hiện trong bài — thường là tên sản phẩm, dịch vụ, hoặc chủ đề chính bạn nhắm SEO." />
          </label>
          <input
            className="seo-input"
            type="text"
            placeholder="Ví dụ: điền form tự động"
            value={targetKeyword}
            onChange={(e) => setTargetKeyword(e.target.value)}
          />
        </div>

        <div className="seo-cost-row">
          <FiZap className="seo-cost-icon" />
          <span>Chi phí: <strong>1 credit</strong> / lần phân tích</span>
        </div>

        <button className="btn-ink seo-submit" onClick={handleAnalyze} disabled={loading}>
          {loading ? <><FiLoader className="spin" /> Đang phân tích...</> : <><FiTrendingUp /> Phân tích ngay</>}
        </button>
      </div>

      {result && (
        <div className="seo-results">
          <div className="seo-stat-grid">
            <div className="seo-stat-card">
              <span className="seo-stat-value">{result.readability.word_count}</span>
              <span className="seo-stat-label">Tổng số từ</span>
            </div>
            <div className="seo-stat-card">
              <span className="seo-stat-value">{result.readability.sentence_count}</span>
              <span className="seo-stat-label">Số câu</span>
            </div>
            <div className="seo-stat-card">
              <span className="seo-stat-value">{result.readability.avg_words_per_sentence}</span>
              <span className="seo-stat-label">Từ/câu trung bình</span>
            </div>
            <div className="seo-stat-card">
              <span className="seo-stat-value">{result.readability.char_count}</span>
              <span className="seo-stat-label">Ký tự</span>
            </div>
          </div>

          {result.target_keyword && (
            <div className="seo-card">
              <h3><FiTarget /> Target keyword: "{result.target_keyword.keyword}"</h3>
              <div className={`seo-assessment seo-assessment--${ASSESSMENT_META[result.target_keyword.assessment].cls}`}>
                {ASSESSMENT_META[result.target_keyword.assessment].icon}
                {ASSESSMENT_META[result.target_keyword.assessment].label}
              </div>
              <div className="seo-kw-detail">
                <span>Xuất hiện <strong>{result.target_keyword.count}</strong> lần</span>
                <span>Mật độ <strong>{result.target_keyword.density}%</strong></span>
                <span>{result.target_keyword.in_first_100_words ? '✓ Có trong 100 từ đầu' : '✗ Không có trong 100 từ đầu'}</span>
              </div>
              <p className="seo-hint">
                Mật độ chuẩn SEO: 0.5% – 3%. Dưới 0.5% là quá thấp, trên 3% có thể bị coi là nhồi nhét từ khóa.
              </p>
            </div>
          )}

          <div className="seo-card">
            <h3>Top từ khóa xuất hiện nhiều nhất</h3>
            <table className="seo-table">
              <thead>
                <tr><th>Từ</th><th>Số lần</th><th>Mật độ</th></tr>
              </thead>
              <tbody>
                {result.keyword_density.unigrams.map((row) => (
                  <tr key={row.term}>
                    <td>{row.term}</td>
                    <td>{row.count}</td>
                    <td>{row.density}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="seo-card">
            <h3>Top cụm 2 từ (bigram)</h3>
            <table className="seo-table">
              <thead>
                <tr><th>Cụm từ</th><th>Số lần</th><th>Mật độ</th></tr>
              </thead>
              <tbody>
                {result.keyword_density.bigrams.map((row) => (
                  <tr key={row.term}>
                    <td>{row.term}</td>
                    <td>{row.count}</td>
                    <td>{row.density}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeoAnalyzer;
