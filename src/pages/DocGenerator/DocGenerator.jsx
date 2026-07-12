import React, { useState, useContext } from 'react';
import './DocGenerator.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../services/axiosClient';
import { AuthContext } from '../../contexts/AuthContext';
import { FiLoader, FiFilePlus, FiZap, FiDownload, FiFileText, FiFile } from 'react-icons/fi';
import { HelpPanel, HelpSteps, HelpTip, FieldHint } from '../../components/ui/HelpPanel';

const MAX_CHARS = 20000;
const SAMPLE_CONTENT = `# Báo cáo công việc tuần

## Tổng quan
Đây là đoạn mô tả tổng quan về công việc trong tuần.

## Danh sách công việc đã hoàn thành
- Hoàn thành thiết kế giao diện
- Fix 5 bug quan trọng
- Họp với khách hàng

## Kế hoạch tuần tới
Tiếp tục triển khai các tính năng còn lại.`;

function DocGenerator() {
  const { refreshWallet } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [format, setFormat] = useState('docx');
  const [loading, setLoading] = useState(false);
  const [resultReady, setResultReady] = useState(false);

  const handleGenerate = async () => {
    if (!content.trim()) { toast.warn('Vui lòng nhập nội dung.'); return; }
    setLoading(true);
    setResultReady(false);
    try {
      const res = await axiosClient.post('/doc-generator/generate', {
        title: title.trim(), content, format,
      });
      const { file_base64, mime, cost } = res.data;
      const byteChars = atob(file_base64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: mime });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${title.trim() || 'document'}.${format}`;
      a.click();
      setResultReady(true);
      toast.success(`Tạo tài liệu xong! (-${cost} credit)`);
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
    <div className="dgn-page animate-slide-up">
      <ToastContainer position="bottom-right" theme="colored" />

      <div className="dgn-hero">
        <div className="dgn-hero-badge"><FiFilePlus /> DOC GENERATOR</div>
        <h1 className="dgn-hero-title">Tạo tài liệu <span className="dgn-hero-accent">nhanh chóng</span></h1>
        <p className="dgn-hero-desc">
          Nhập văn bản có định dạng (tiêu đề, danh sách) — xuất ngay file Word hoặc PDF chuyên nghiệp.
        </p>
      </div>

      <HelpPanel>
        <HelpSteps steps={[
          <>(Không bắt buộc) Nhập tiêu đề tài liệu — sẽ hiện thành heading lớn ở đầu file.</>,
          <>Nhập nội dung theo cú pháp định dạng nhẹ: <code># Tiêu đề</code> cho heading lớn, <code>## Tiêu đề phụ</code> cho heading nhỏ, <code>- mục</code> cho gạch đầu dòng, dòng thường sẽ thành đoạn văn bản.</>,
          <>Bấm <strong>"Dùng mẫu"</strong> nếu muốn xem ví dụ có sẵn trước khi tự viết.</>,
          <>Chọn định dạng xuất: <strong>Word (.docx)</strong> để chỉnh sửa tiếp, hoặc <strong>PDF</strong> để gửi/in ngay.</>,
          <>Nhấn <strong>"Tạo & tải xuống"</strong> — file tải về máy ngay lập tức, không cần chờ ở trang khác.</>,
        ]} />
        <HelpTip>
          Phù hợp cho báo cáo công việc, biên bản họp, tài liệu nội bộ cần tạo nhanh — không thay thế công cụ soạn thảo phức tạp có bảng biểu, hình ảnh chèn tùy ý.
        </HelpTip>
      </HelpPanel>

      <div className="dgn-main">
        <div className="dgn-field">
          <label className="dgn-label">
            Tiêu đề tài liệu (không bắt buộc)
            <FieldHint text="Tiêu đề này sẽ được định dạng thành heading lớn nhất, tách biệt với nội dung bên dưới." />
          </label>
          <input className="dgn-input" type="text" placeholder="Ví dụ: Báo cáo tháng 7"
            value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} />
        </div>

        <div className="dgn-field">
          <div className="dgn-field-header">
            <label className="dgn-label">Nội dung</label>
            <div className="dgn-field-actions">
              <button className="dgn-sample-btn" onClick={() => setContent(SAMPLE_CONTENT)}>Dùng mẫu</button>
              <span className="dgn-charcount">{content.length} / {MAX_CHARS}</span>
            </div>
          </div>
          <textarea
            className="dgn-textarea"
            placeholder={`# Tiêu đề lớn\n## Tiêu đề nhỏ\n- Mục danh sách\nĐoạn văn bản thường`}
            value={content}
            maxLength={MAX_CHARS}
            onChange={(e) => setContent(e.target.value)}
          />
          <p className="dgn-hint">
            Dùng <code># Tiêu đề</code>, <code>## Tiêu đề phụ</code>, <code>- mục</code> để định dạng tự động.
          </p>
        </div>

        <div className="dgn-field">
          <label className="dgn-label">Định dạng xuất</label>
          <div className="dgn-format-tabs">
            <button className={`dgn-format-tab ${format === 'docx' ? 'active' : ''}`} onClick={() => setFormat('docx')}>
              <FiFileText /> Word (.docx)
            </button>
            <button className={`dgn-format-tab ${format === 'pdf' ? 'active' : ''}`} onClick={() => setFormat('pdf')}>
              <FiFile /> PDF (.pdf)
            </button>
          </div>
        </div>

        <div className="dgn-cost-row">
          <FiZap className="dgn-cost-icon" />
          <span>Chi phí: <strong>1 credit</strong> / lần tạo</span>
        </div>

        <button className="btn-ink dgn-submit" onClick={handleGenerate} disabled={loading}>
          {loading ? <><FiLoader className="spin" /> Đang tạo...</> : <><FiDownload /> Tạo & tải xuống</>}
        </button>

        {resultReady && <p className="dgn-success-text">✓ Tài liệu đã được tải xuống!</p>}
      </div>
    </div>
  );
}

export default DocGenerator;
