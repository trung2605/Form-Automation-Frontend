import React, { useState, useContext } from 'react';
import './DataExtractor.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../services/axiosClient';
import { AuthContext } from '../../contexts/AuthContext';
import {
  FiLoader, FiDatabase, FiZap, FiLink, FiGrid, FiList, FiDownload, FiExternalLink,
} from 'react-icons/fi';
import { HelpPanel, HelpSteps, HelpTip, HelpWarning, FieldHint } from '../../components/ui/HelpPanel';

const MODE_OPTIONS = [
  { key: 'auto', label: 'Tự động' },
  { key: 'tables', label: 'Chỉ bảng' },
  { key: 'lists', label: 'Chỉ danh sách' },
];

function DataExtractor() {
  const { refreshWallet } = useContext(AuthContext);
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTableIdx, setActiveTableIdx] = useState(0);

  const handleExtract = async () => {
    if (!url.trim()) { toast.warn('Vui lòng nhập URL.'); return; }

    setLoading(true);
    setResult(null);
    try {
      const res = await axiosClient.post('/extractor/extract', { url: url.trim(), mode });
      setResult(res.data);
      setActiveTableIdx(0);
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

  const downloadCsv = (table) => {
    const rows = [table.header, ...table.rows];
    const csv = rows.map(r => r.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'table.csv';
    a.click();
  };

  return (
    <div className="dex-page animate-slide-up">
      <ToastContainer position="bottom-right" theme="colored" />

      <div className="dex-hero">
        <div className="dex-hero-badge"><FiDatabase /> DATA EXTRACTOR</div>
        <h1 className="dex-hero-title">Trích xuất <span className="dex-hero-accent">dữ liệu</span></h1>
        <p className="dex-hero-desc">
          Quét 1 URL, tự động trích bảng và danh sách có cấu trúc thành dữ liệu dùng ngay.
        </p>
      </div>

      <HelpPanel>
        <HelpSteps steps={[
          <>Dán URL trang web cần quét (phải là trang công khai, không cần đăng nhập).</>,
          <>Chọn chế độ trích xuất: <strong>Tự động</strong> (lấy cả bảng lẫn danh sách), <strong>Chỉ bảng</strong>, hoặc <strong>Chỉ danh sách</strong>.</>,
          <>Nhấn <strong>"Trích xuất ngay"</strong> — hệ thống trả về thông tin trang (title, mô tả, số bảng/danh sách/liên kết), toàn bộ bảng dữ liệu tìm được, các danh sách (ul/ol), và danh sách liên kết trong trang.</>,
          <>Với mỗi bảng, chuyển tab để xem bảng khác nhau, nhấn <strong>"Tải CSV"</strong> để tải riêng từng bảng về máy.</>,
        ]} />
        <HelpTip>
          Dùng tool này để nhanh chóng lấy bảng giá, danh sách sản phẩm, bảng xếp hạng... từ 1 trang web mà không cần copy-paste thủ công.
        </HelpTip>
        <HelpWarning>
          Trang có chặn bot (Cloudflare, yêu cầu đăng nhập, captcha) sẽ không quét được. Kết quả phụ thuộc vào cấu trúc HTML thật của trang — trang dùng JavaScript render nội dung động (SPA) có thể không lấy được đầy đủ dữ liệu.
        </HelpWarning>
      </HelpPanel>

      <div className="dex-main">
        <div className="dex-field">
          <label className="dex-label">
            URL trang web
            <FieldHint text="Dán link đầy đủ bắt đầu bằng http:// hoặc https://. Trang càng có cấu trúc bảng/danh sách rõ ràng thì kết quả càng chính xác." />
          </label>
          <input
            className="dex-input"
            type="text"
            placeholder="https://example.com/trang-can-quet"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="dex-field">
          <label className="dex-label">Chế độ trích xuất</label>
          <div className="dex-mode-tabs">
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={`dex-mode-tab ${mode === opt.key ? 'active' : ''}`}
                onClick={() => setMode(opt.key)}
              >{opt.label}</button>
            ))}
          </div>
        </div>

        <div className="dex-cost-row">
          <FiZap className="dex-cost-icon" />
          <span>Chi phí: <strong>1 credit</strong> / lần quét</span>
        </div>

        <button className="btn-ink dex-submit" onClick={handleExtract} disabled={loading}>
          {loading ? <><FiLoader className="spin" /> Đang quét...</> : <><FiDatabase /> Trích xuất ngay</>}
        </button>
      </div>

      {result && (
        <div className="dex-results">
          <div className="dex-card">
            <h3><FiLink /> Thông tin trang</h3>
            <p className="dex-meta-title">{result.meta.title || '(không có tiêu đề)'}</p>
            {result.meta.description && <p className="dex-meta-desc">{result.meta.description}</p>}
            <div className="dex-meta-stats">
              <span>{result.table_count} bảng</span>
              <span>{result.list_count} danh sách</span>
              <span>{result.meta.headings.length} tiêu đề</span>
              <span>{result.meta.links.length} liên kết</span>
            </div>
          </div>

          {result.tables.length > 0 && (
            <div className="dex-card">
              <h3><FiGrid /> Bảng dữ liệu</h3>
              <div className="dex-table-tabs">
                {result.tables.map((t, i) => (
                  <button key={i}
                    className={`dex-table-tab ${activeTableIdx === i ? 'active' : ''}`}
                    onClick={() => setActiveTableIdx(i)}
                  >Bảng {i + 1} ({t.rows.length} dòng)</button>
                ))}
              </div>
              {result.tables[activeTableIdx] && (
                <>
                  <div className="dex-table-wrap">
                    <table className="dex-table">
                      <thead>
                        <tr>
                          {result.tables[activeTableIdx].header.map((h, i) => <th key={i}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {result.tables[activeTableIdx].rows.slice(0, 50).map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button className="btn-outline dex-download-btn" onClick={() => downloadCsv(result.tables[activeTableIdx])}>
                    <FiDownload /> Tải CSV
                  </button>
                </>
              )}
            </div>
          )}

          {result.lists.length > 0 && (
            <div className="dex-card">
              <h3><FiList /> Danh sách</h3>
              <div className="dex-lists-grid">
                {result.lists.slice(0, 6).map((lst, i) => (
                  <div key={i} className="dex-list-block">
                    <span className="dex-list-idx">Danh sách {i + 1}</span>
                    <ul>
                      {lst.slice(0, 8).map((item, j) => <li key={j}>{item}</li>)}
                    </ul>
                    {lst.length > 8 && <span className="dex-list-more">+{lst.length - 8} mục khác</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.meta.links.length > 0 && (
            <div className="dex-card">
              <h3><FiExternalLink /> Liên kết ({result.meta.links.length})</h3>
              <div className="dex-links-list">
                {result.meta.links.slice(0, 20).map((link, i) => (
                  <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className="dex-link-item">
                    {link.text}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DataExtractor;
