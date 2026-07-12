import React, { useState, useContext, useRef } from 'react';
import './CsvCleaner.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../services/axiosClient';
import { AuthContext } from '../../contexts/AuthContext';
import { FiUploadCloud, FiLoader, FiDownload, FiCheckCircle, FiZap, FiFile } from 'react-icons/fi';
import { HelpPanel, HelpSteps, HelpTip } from '../../components/ui/HelpPanel';

function CsvCleaner() {
  const { refreshWallet } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (!/\.(csv|xlsx|xls)$/i.test(f.name)) {
      toast.error('Vui lòng chọn file CSV hoặc Excel (.csv, .xlsx, .xls).');
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleClean = async () => {
    if (!file) { toast.warn('Vui lòng chọn file!'); return; }
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axiosClient.post('/csv-cleaner/clean', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      toast.success(`Làm sạch xong! (-${res.data.cost} credit)`);
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

  const downloadCsv = () => {
    if (!result?.csv_content) return;
    const blob = new Blob([result.csv_content], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cleaned_${file?.name?.replace(/\.[^.]+$/, '') || 'data'}.csv`;
    a.click();
  };

  return (
    <div className="csvc-page animate-slide-up">
      <ToastContainer position="bottom-right" theme="colored" />

      <div className="csvc-hero">
        <div className="csvc-hero-badge"><FiFile /> CSV / EXCEL CLEANER</div>
        <h1 className="csvc-hero-title">Làm sạch <span className="csvc-hero-accent">dữ liệu</span></h1>
        <p className="csvc-hero-desc">
          Tự động xóa dòng trùng, khoảng trắng thừa, cột/dòng trống — tải lên và nhận file sạch ngay.
        </p>
      </div>

      <HelpPanel>
        <HelpSteps steps={[
          <>Kéo thả hoặc click chọn file (.csv, .xlsx, .xls — tối đa 15MB).</>,
          <>Nhấn <strong>"Làm sạch ngay"</strong> — hệ thống tự động xóa dòng trùng lặp, khoảng trắng thừa, dòng/cột trống hoàn toàn, và chuẩn hóa tên cột.</>,
          <>Xem báo cáo chi tiết các thao tác đã thực hiện và bảng xem trước dữ liệu đã sạch (50 dòng đầu).</>,
          <>Nhấn <strong>"Tải file CSV đã làm sạch"</strong> để tải kết quả về máy.</>,
        ]} />
        <HelpTip>
          File Excel nhiều sheet chỉ đọc <strong>sheet đầu tiên</strong>. Nếu dữ liệu nằm ở sheet khác, tách riêng ra file mới trước khi tải lên.
        </HelpTip>
      </HelpPanel>

      <div className="csvc-main">
        <div
          className={`csvc-dropzone ${file ? 'has-file' : ''}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" hidden
            onChange={(e) => handleFile(e.target.files[0])} />
          <FiUploadCloud className="csvc-upload-icon" />
          {file ? (
            <p className="csvc-upload-text">{file.name} ({(file.size / 1024).toFixed(0)} KB)</p>
          ) : (
            <>
              <p className="csvc-upload-text">Kéo thả file vào đây hoặc click để chọn</p>
              <p className="csvc-upload-hint">Hỗ trợ CSV, XLSX, XLS · tối đa 15MB</p>
            </>
          )}
        </div>

        <div className="csvc-cost-row">
          <FiZap className="csvc-cost-icon" />
          <span>Chi phí: <strong>1 credit</strong> / lần làm sạch</span>
        </div>

        <button className="btn-ink csvc-submit" onClick={handleClean} disabled={loading || !file}>
          {loading ? <><FiLoader className="spin" /> Đang xử lý...</> : <><FiCheckCircle /> Làm sạch ngay</>}
        </button>
      </div>

      {result && (
        <div className="csvc-results">
          <div className="csvc-card">
            <h3><FiCheckCircle /> Báo cáo làm sạch</h3>
            <div className="csvc-stat-grid">
              <div className="csvc-stat">
                <span className="csvc-stat-value">{result.report.original_rows} → {result.report.cleaned_rows}</span>
                <span className="csvc-stat-label">Số dòng</span>
              </div>
              <div className="csvc-stat">
                <span className="csvc-stat-value">{result.report.original_cols} → {result.report.cleaned_cols}</span>
                <span className="csvc-stat-label">Số cột</span>
              </div>
            </div>
            <ul className="csvc-actions-list">
              {result.report.actions.map((a, i) => <li key={i}><FiCheckCircle /> {a}</li>)}
            </ul>
            <button className="btn-ink csvc-download-btn" onClick={downloadCsv}>
              <FiDownload /> Tải file CSV đã làm sạch
            </button>
          </div>

          <div className="csvc-card">
            <h3>Xem trước dữ liệu ({result.preview_rows.length} dòng đầu)</h3>
            <div className="csvc-table-wrap">
              <table className="csvc-table">
                <thead>
                  <tr>{result.columns.map((c, i) => <th key={i}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {result.preview_rows.map((row, ri) => (
                    <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CsvCleaner;
