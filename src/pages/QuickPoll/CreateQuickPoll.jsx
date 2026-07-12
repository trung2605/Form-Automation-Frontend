import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../services/axiosClient';
import { FiBarChart2, FiLoader, FiArrowRight, FiPlus, FiX } from 'react-icons/fi';
import { HelpPanel, HelpSteps, HelpTip } from '../../components/ui/HelpPanel';
import './QuickPoll.css';

function CreateQuickPoll() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateOption = (i, val) => setOptions(options.map((o, idx) => idx === i ? val : o));
  const addOption = () => { if (options.length < 10) setOptions([...options, '']); };
  const removeOption = (i) => { if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i)); };

  const handleCreate = async () => {
    if (!question.trim()) { toast.warn('Vui lòng nhập câu hỏi.'); return; }
    const validOptions = options.map(o => o.trim()).filter(Boolean);
    if (validOptions.length < 2) { toast.warn('Vui lòng nhập ít nhất 2 lựa chọn.'); return; }

    setLoading(true);
    try {
      const res = await axiosClient.post('/poll/polls', {
        question: question.trim(), options: validOptions, allow_multiple: allowMultiple,
      });
      navigate(`/poll/${res.data.code}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Không thể tạo bình chọn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qpl-create-page animate-slide-up">
      <ToastContainer position="bottom-right" theme="colored" />

      <div className="qpl-create-hero">
        <div className="qpl-hero-badge"><FiBarChart2 /> POLL / VOTE NHANH</div>
        <h1 className="qpl-hero-title">Tạo bình chọn <span className="qpl-hero-accent">tức thì</span></h1>
        <p className="qpl-hero-desc">
          Đặt câu hỏi, chia sẻ link, xem kết quả cập nhật real-time — không cần đăng nhập để tham gia.
        </p>
      </div>

      <HelpPanel>
        <HelpSteps steps={[
          <>Nhập câu hỏi và ít nhất 2 lựa chọn (tối đa 10).</>,
          <>Tùy chọn: bật "Cho phép chọn nhiều lựa chọn" nếu muốn cho phép vote nhiều đáp án cùng lúc.</>,
          <>Nhấn <strong>"Tạo bình chọn"</strong> — chuyển ngay tới trang kết quả, copy link gửi nhóm.</>,
          <>Người vote chỉ cần mở link (không cần đăng nhập), chọn đáp án, nhấn gửi — kết quả cập nhật real-time cho tất cả mọi người.</>,
          <>Vote lại sẽ ghi đè lựa chọn cũ. Bất kỳ ai cũng có thể bấm "Đóng bình chọn" để khóa kết quả cuối cùng.</>,
        ]} />
        <HelpTip>Hoàn toàn miễn phí, không giới hạn số người vote. Dùng cho chọn quán ăn, chốt lịch, bình chọn ý kiến nhanh trong nhóm.</HelpTip>
      </HelpPanel>

      <div className="qpl-create-card">
        <label className="qpl-label">Câu hỏi</label>
        <input className="qpl-input" type="text" placeholder="Ví dụ: Trưa nay ăn gì?"
          value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={200} />

        <label className="qpl-label">Các lựa chọn</label>
        {options.map((opt, i) => (
          <div key={i} className="qpl-option-row">
            <input className="qpl-input" type="text" placeholder={`Lựa chọn ${i + 1}`}
              value={opt} onChange={(e) => updateOption(i, e.target.value)} maxLength={100} />
            {options.length > 2 && (
              <button className="qpl-remove-btn" onClick={() => removeOption(i)}><FiX /></button>
            )}
          </div>
        ))}
        {options.length < 10 && (
          <button className="qpl-add-btn" onClick={addOption}><FiPlus /> Thêm lựa chọn</button>
        )}

        <label className="qpl-checkbox-label">
          <input type="checkbox" checked={allowMultiple} onChange={(e) => setAllowMultiple(e.target.checked)} />
          Cho phép chọn nhiều lựa chọn
        </label>

        <button className="btn-ink qpl-create-btn" onClick={handleCreate} disabled={loading}>
          {loading ? <><FiLoader className="spin" /> Đang tạo...</> : <>Tạo bình chọn <FiArrowRight /></>}
        </button>
      </div>
    </div>
  );
}

export default CreateQuickPoll;
