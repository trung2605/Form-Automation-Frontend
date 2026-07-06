import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../services/axiosClient';
import { FiUsers, FiLoader, FiArrowRight } from 'react-icons/fi';
import './GroupSplit.css';

function CreateSplitGroup() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.post('/split/groups', { title: title.trim() });
      const { code } = res.data;
      toast.success('Đã tạo nhóm!');
      navigate(`/split/${code}`);
    } catch (error) {
      toast.error('Không thể tạo nhóm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gsp-create-page animate-slide-up">
      <ToastContainer position="bottom-right" theme="colored" />

      <div className="gsp-create-hero">
        <div className="gsp-hero-badge"><FiUsers /> CHIA TIỀN NHÓM</div>
        <h1 className="gsp-hero-title">Chia tiền <span className="gsp-hero-accent">công bằng</span></h1>
        <p className="gsp-hero-desc">
          Tạo nhóm, chia sẻ link cho bạn bè, mỗi người tự nhập số tiền đã chi — hệ thống tự tính ai cần trả ai bao nhiêu.
        </p>
      </div>

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
