import React, { useState, useContext, useRef } from 'react';
import './ImageToText.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../services/axiosClient';
import { AuthContext } from '../../contexts/AuthContext';
import { FiUploadCloud, FiLoader, FiCopy, FiImage, FiZap, FiFileText } from 'react-icons/fi';
import { HelpPanel, HelpSteps, HelpTip } from '../../components/ui/HelpPanel';

function ImageToText() {
  const { refreshWallet } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh hợp lệ (jpg, png, webp...).');
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleExtract = async () => {
    if (!file) { toast.warn('Vui lòng chọn ảnh!'); return; }
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axiosClient.post('/ocr/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      toast.success(`Trích xuất xong! (-${res.data.cost} credit)`);
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
    if (!result?.text) return;
    navigator.clipboard.writeText(result.text);
    toast.success('Đã copy văn bản!');
  };

  return (
    <div className="itt-page animate-slide-up">
      <ToastContainer position="bottom-right" theme="colored" />

      <div className="itt-hero">
        <div className="itt-hero-badge"><FiImage /> IMAGE TO TEXT</div>
        <h1 className="itt-hero-title">Trích văn bản <span className="itt-hero-accent">từ ảnh</span></h1>
        <p className="itt-hero-desc">
          Tải lên ảnh chụp tài liệu, biển hiệu, ghi chú viết tay — AI tự trích văn bản chính xác.
        </p>
      </div>

      <HelpPanel>
        <HelpSteps steps={[
          <>Kéo thả hoặc click chọn ảnh (jpg, png, webp, bmp — tối đa 10MB).</>,
          <>Xem trước ảnh ngay trong khung upload để xác nhận đúng ảnh cần trích.</>,
          <>Nhấn <strong>"Trích xuất văn bản"</strong> — AI đọc toàn bộ chữ trong ảnh, giữ nguyên định dạng xuống dòng gần nhất có thể.</>,
          <>Dùng nút <strong>Copy</strong> để sao chép kết quả.</>,
        ]} />
        <HelpTip>
          Hoạt động tốt nhất với ảnh chụp rõ nét, chữ không bị nghiêng/mờ quá nhiều — phù hợp cho tài liệu scan, biển hiệu, ghi chú viết tay, ảnh chụp bảng/slide thuyết trình.
        </HelpTip>
      </HelpPanel>

      <div className="itt-main">
        <div
          className={`itt-dropzone ${file ? 'has-file' : ''}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {previewUrl ? (
            <img src={previewUrl} alt="preview" className="itt-preview-img" />
          ) : (
            <>
              <FiUploadCloud className="itt-upload-icon" />
              <p className="itt-upload-text">Kéo thả ảnh vào đây hoặc click để chọn</p>
              <p className="itt-upload-hint">Hỗ trợ JPG, PNG, WEBP, BMP · tối đa 10MB</p>
            </>
          )}
        </div>

        {file && (
          <p className="itt-file-name">{file.name} ({(file.size / 1024).toFixed(0)} KB)</p>
        )}

        <div className="itt-cost-row">
          <FiZap className="itt-cost-icon" />
          <span>Chi phí: <strong>1 credit</strong> / lần trích xuất</span>
        </div>

        <button className="btn-ink itt-submit" onClick={handleExtract} disabled={loading || !file}>
          {loading ? <><FiLoader className="spin" /> Đang trích xuất...</> : <><FiImage /> Trích xuất văn bản</>}
        </button>
      </div>

      {result && (
        <div className="itt-result">
          <div className="itt-result-header">
            <h3><FiFileText /> Văn bản trích xuất</h3>
            <button className="itt-copy-btn" onClick={copyText}><FiCopy /> Copy</button>
          </div>
          {result.text ? (
            <pre className="itt-result-text">{result.text}</pre>
          ) : (
            <p className="itt-empty">Không tìm thấy văn bản nào trong ảnh.</p>
          )}
          <div className="itt-stats">
            <span>{result.char_count} ký tự</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageToText;
