import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../services/axiosClient';
import { FiCalendar, FiLoader, FiArrowRight, FiCopy, FiCheckCircle, FiPlus, FiX } from 'react-icons/fi';
import { HelpPanel, HelpSteps, HelpTip, HelpWarning } from '../../components/ui/HelpPanel';
import './MeetingPoll.css';

const DEFAULT_TIME_LABELS = ['08:00-09:00', '09:00-10:00', '14:00-15:00', '15:00-16:00', '19:00-20:00'];

function CreateMeetingPoll() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [dates, setDates] = useState(['']);
  const [timeLabels, setTimeLabels] = useState([...DEFAULT_TIME_LABELS]);
  const [customTime, setCustomTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);

  const addDateField = () => setDates([...dates, '']);
  const updateDate = (i, val) => setDates(dates.map((d, idx) => idx === i ? val : d));
  const removeDate = (i) => setDates(dates.filter((_, idx) => idx !== i));

  const toggleTimeLabel = (label) => {
    setTimeLabels(prev => prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]);
  };

  const addCustomTime = () => {
    const t = customTime.trim();
    if (t && !timeLabels.includes(t)) {
      setTimeLabels([...timeLabels, t]);
      setCustomTime('');
    }
  };

  const handleCreate = async () => {
    const validDates = dates.map(d => d.trim()).filter(Boolean);
    if (validDates.length === 0) { toast.warn('Vui lòng chọn ít nhất 1 ngày.'); return; }
    if (timeLabels.length === 0) { toast.warn('Vui lòng chọn ít nhất 1 khung giờ.'); return; }

    setLoading(true);
    try {
      const res = await axiosClient.post('/meeting/polls', {
        title: title.trim(), dates: validDates, time_labels: timeLabels,
      });
      setCreated({ code: res.data.code, group_password: res.data.group_password });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Không thể tạo lịch hẹn.');
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(created.group_password);
    toast.success('Đã copy mật khẩu!');
  };

  if (created) {
    return (
      <div className="mtp-create-page animate-slide-up">
        <ToastContainer position="bottom-right" theme="colored" />
        <div className="mtp-create-hero">
          <div className="mtp-hero-badge"><FiCheckCircle /> ĐÃ TẠO LỊCH HẸN</div>
          <h1 className="mtp-hero-title">Lưu lại <span className="mtp-hero-accent">mật khẩu</span> này</h1>
          <p className="mtp-hero-desc">
            Đây là mật khẩu để mọi người truy cập lịch hẹn. Chỉ hiện <strong>một lần duy nhất</strong>.
          </p>
        </div>
        <div className="mtp-create-card mtp-password-reveal">
          <label className="mtp-label">Mật khẩu lịch hẹn</label>
          <div className="mtp-password-box">
            <span className="mtp-password-text">{created.group_password}</span>
            <button className="mtp-copy-btn" onClick={copyPassword}><FiCopy /> Copy</button>
          </div>
          <p className="mtp-hint">Mã lịch hẹn: <strong>{created.code}</strong></p>
          <button className="btn-ink mtp-create-btn" onClick={() => navigate(`/meeting/${created.code}`)}>
            Vào lịch hẹn <FiArrowRight />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mtp-create-page animate-slide-up">
      <ToastContainer position="bottom-right" theme="colored" />

      <div className="mtp-create-hero">
        <div className="mtp-hero-badge"><FiCalendar /> LỊCH HẸN NHÓM</div>
        <h1 className="mtp-hero-title">Tìm giờ <span className="mtp-hero-accent">rảnh chung</span></h1>
        <p className="mtp-hero-desc">
          Tạo lịch hẹn, chia sẻ link cho mọi người, mỗi người tick khung giờ mình rảnh — hệ thống tự tìm giờ đông người rảnh nhất.
        </p>
      </div>

      <HelpPanel>
        <HelpSteps steps={[
          <>Đặt tên sự kiện rồi chọn các <strong>ngày đề xuất</strong> — thêm nhiều ngày cũng được, ít nhất 1 ngày.</>,
          <>Chọn hoặc tự thêm <strong>khung giờ</strong> — có sẵn khung mẫu (sáng/chiều/tối), click để bỏ/tick, tự thêm giờ tùy chỉnh nếu cần.</>,
          <>Nhấn <strong>"Tạo lịch hẹn"</strong> — nhận mã + mật khẩu hiện đúng 1 lần, gửi cho nhóm.</>,
          <>Mỗi thành viên mở link, nhập mật khẩu, đặt tên + password riêng, rồi click vào các ô trên lưới ngày/giờ mình rảnh.</>,
          <>Khi mọi người đã chọn xong, bất kỳ ai bấm <strong>"Chốt lịch hẹn"</strong> — hệ thống tự chọn khung giờ nhiều người rảnh nhất.</>,
        ]} />
        <HelpTip>Không cần tài khoản để tham gia — chỉ người tạo cần đăng nhập.</HelpTip>
        <HelpWarning>Mật khẩu lịch hẹn chỉ hiển thị 1 lần lúc tạo. Làm mất = tạo lịch mới.</HelpWarning>
      </HelpPanel>

      <div className="mtp-create-card">
        <label className="mtp-label">Tên sự kiện (không bắt buộc)</label>
        <input className="mtp-input" type="text" placeholder="Ví dụ: Họp nhóm đồ án"
          value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />

        <label className="mtp-label">Các ngày đề xuất</label>
        {dates.map((d, i) => (
          <div key={i} className="mtp-date-row">
            <input className="mtp-input" type="date" value={d} onChange={(e) => updateDate(i, e.target.value)} />
            {dates.length > 1 && (
              <button className="mtp-remove-btn" onClick={() => removeDate(i)}><FiX /></button>
            )}
          </div>
        ))}
        <button className="mtp-add-btn" onClick={addDateField}><FiPlus /> Thêm ngày</button>

        <label className="mtp-label">Khung giờ đề xuất</label>
        <div className="mtp-time-chips">
          {DEFAULT_TIME_LABELS.map((label) => (
            <button key={label}
              className={`mtp-chip ${timeLabels.includes(label) ? 'active' : ''}`}
              onClick={() => toggleTimeLabel(label)}
            >{label}</button>
          ))}
          {timeLabels.filter(l => !DEFAULT_TIME_LABELS.includes(l)).map((label) => (
            <button key={label} className="mtp-chip active" onClick={() => toggleTimeLabel(label)}>
              {label}
            </button>
          ))}
        </div>
        <div className="mtp-custom-time-row">
          <input className="mtp-input" type="text" placeholder="Khung giờ tùy chỉnh, VD: 20:00-21:00"
            value={customTime} onChange={(e) => setCustomTime(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomTime()} />
          <button className="mtp-add-btn" onClick={addCustomTime}><FiPlus /> Thêm</button>
        </div>

        <button className="btn-ink mtp-create-btn" onClick={handleCreate} disabled={loading}>
          {loading ? <><FiLoader className="spin" /> Đang tạo...</> : <>Tạo lịch hẹn <FiArrowRight /></>}
        </button>
      </div>
    </div>
  );
}

export default CreateMeetingPoll;
