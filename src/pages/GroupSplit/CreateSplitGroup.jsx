import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../services/axiosClient';
import { FiUsers, FiLoader, FiArrowRight, FiCopy, FiCheckCircle } from 'react-icons/fi';
import { HelpPanel, HelpSteps, HelpTip, HelpWarning } from '../../components/ui/HelpPanel';
import './GroupSplit.css';

function CreateSplitGroup() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null); // { code, group_password }

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.post('/split/groups', { title: title.trim() });
      const { code, group_password } = res.data;
      setCreated({ code, group_password });
    } catch (error) {
      toast.error('Không thể tạo nhóm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(created.group_password);
    toast.success('Đã copy mật khẩu!');
  };

  const goToGroup = () => {
    navigate(`/split/${created.code}`);
  };

  if (created) {
    return (
      <div className="gsp-create-page animate-slide-up">
        <ToastContainer position="bottom-right" theme="colored" />
        <div className="gsp-create-hero">
          <div className="gsp-hero-badge"><FiCheckCircle /> ĐÃ TẠO NHÓM</div>
          <h1 className="gsp-hero-title">Lưu lại <span className="gsp-hero-accent">mật khẩu</span> này</h1>
          <p className="gsp-hero-desc">
            Đây là mật khẩu để mọi người truy cập nhóm. Chỉ hiện <strong>một lần duy nhất</strong> — hãy copy và gửi cho những người bạn muốn mời.
          </p>
        </div>

        <div className="gsp-create-card gsp-password-reveal">
          <label className="gsp-label">Mật khẩu nhóm</label>
          <div className="gsp-password-box">
            <span className="gsp-password-text">{created.group_password}</span>
            <button className="gsp-copy-btn" onClick={copyPassword}><FiCopy /> Copy</button>
          </div>
          <p className="gsp-hint">Mã nhóm: <strong>{created.code}</strong></p>
          <button className="btn-ink gsp-create-btn" onClick={goToGroup}>
            Vào nhóm <FiArrowRight />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gsp-create-page animate-slide-up">
      <ToastContainer position="bottom-right" theme="colored" />

      <div className="gsp-create-hero">
        <div className="gsp-hero-badge"><FiUsers /> CHIA TIỀN NHÓM</div>
        <h1 className="gsp-hero-title">Chia tiền <span className="gsp-hero-accent">công bằng</span></h1>
        <p className="gsp-hero-desc">
          Tạo nhóm, chia sẻ link + mật khẩu cho bạn bè, mỗi người thêm khoản chi tiêu — hệ thống tự tính ai cần trả ai bao nhiêu.
        </p>
      </div>

      <HelpPanel>
        <HelpSteps steps={[
          <>Đặt tên nhóm/chuyến đi (không bắt buộc) rồi nhấn <strong>"Tạo nhóm"</strong>.</>,
          <><strong>Lưu lại mật khẩu hiện ra ngay sau đó — chỉ hiện đúng 1 lần</strong>, đây là mật khẩu để bất kỳ ai có link cũng cần nhập mới xem/tham gia được nhóm.</>,
          <>Copy link + mật khẩu, gửi cho cả nhóm qua Zalo/Messenger/bất kỳ kênh nào.</>,
          <>Mỗi thành viên tự mở link, nhập mật khẩu nhóm, rồi nhập tên + tự đặt một mật khẩu riêng cho tên đó (để lần sau vào lại hoặc sửa chi tiêu, hệ thống nhận đúng là họ).</>,
          <>Ai cũng thêm được khoản chi: nhập số tiền, chọn người đã trả, tick người cùng tham gia chia khoản đó — mỗi khoản chi có thể có nhóm người tham gia khác nhau.</>,
          <>Khi mọi người đã nhập xong, bất kỳ ai bấm <strong>"Chốt nhóm"</strong> — hệ thống tính ra bảng "ai cần chuyển khoản cho ai bao nhiêu".</>,
        ]} />
        <HelpTip>
          Không cần tài khoản để tham gia — chỉ người tạo nhóm cần đăng nhập, các thành viên khác chỉ cần link + mật khẩu nhóm.
        </HelpTip>
        <HelpWarning>
          Mật khẩu nhóm chỉ hiển thị đúng 1 lần lúc tạo — nếu làm mất, không có cách nào lấy lại, phải tạo nhóm mới.
        </HelpWarning>
      </HelpPanel>

      <div className="gsp-create-card">
        <label className="gsp-label">Tên nhóm / chuyến đi (không bắt buộc)</label>
        <input
          type="text"
          className="gsp-input"
          placeholder="Ví dụ: Đi Đà Lạt tháng 7"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
        <button className="btn-ink gsp-create-btn" onClick={handleCreate} disabled={loading}>
          {loading ? <><FiLoader className="spin" /> Đang tạo...</> : <>Tạo nhóm <FiArrowRight /></>}
        </button>
      </div>
    </div>
  );
}

export default CreateSplitGroup;
