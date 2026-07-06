import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../services/axiosClient';
import {
  FiUsers, FiCopy, FiLoader, FiLock, FiEdit2, FiCheck,
  FiArrowRight, FiAlertCircle, FiTrendingUp, FiTrendingDown,
} from 'react-icons/fi';
import './GroupSplit.css';

const POLL_MS = 4000;
const fmt = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0)) + 'đ';

function SplitGroupPage() {
  const { code } = useParams();
  const storageKey = `split_${code}`;

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [memberId, setMemberId] = useState(() => localStorage.getItem(storageKey) || null);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [weight, setWeight] = useState('1');
  const [useWeight, setUseWeight] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

  const pollRef = useRef(null);

  const fetchGroup = useCallback(async () => {
    try {
      const res = await axiosClient.get(`/split/groups/${code}`);
      setGroup(res.data);
      setNotFound(false);
    } catch (error) {
      if (error.response?.status === 404) setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchGroup();
    pollRef.current = setInterval(fetchGroup, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [fetchGroup]);

  const myMember = group?.members?.find(m => m.member_id === memberId) || null;

  const handleSubmit = async () => {
    if (!name.trim()) { toast.warn('Vui lòng nhập tên.'); return; }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 0) { toast.warn('Số tiền không hợp lệ.'); return; }

    setSubmitting(true);
    try {
      const body = { name: name.trim(), amount_spent: amt };
      if (useWeight) body.weight = parseFloat(weight) || 1;
      const res = await axiosClient.post(`/split/groups/${code}/members`, body);
      const { member_id, ...groupData } = res.data;
      localStorage.setItem(storageKey, member_id);
      setMemberId(member_id);
      setGroup(groupData);
      toast.success('Đã gửi chi tiêu của bạn!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Không thể gửi. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 0) { toast.warn('Số tiền không hợp lệ.'); return; }

    setSubmitting(true);
    try {
      const body = { name: name.trim() || myMember.name, amount_spent: amt };
      if (useWeight) body.weight = parseFloat(weight) || 1;
      const res = await axiosClient.patch(`/split/groups/${code}/members/${memberId}`, body);
      setGroup(res.data);
      setEditing(false);
      toast.success('Đã cập nhật!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Không thể cập nhật.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalize = async () => {
    setSubmitting(true);
    try {
      const res = await axiosClient.post(`/split/groups/${code}/finalize`);
      setGroup(res.data);
      toast.success('Đã chốt nhóm!');
    } catch (error) {
      toast.error('Không thể chốt nhóm.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = () => {
    if (!myMember) return;
    setName(myMember.name);
    setAmount(String(myMember.amount_spent));
    setWeight(String(myMember.weight));
    setUseWeight(myMember.weight !== 1);
    setEditing(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã copy link!');
  };

  if (loading) {
    return (
      <div className="gsp-page gsp-center">
        <FiLoader className="spin gsp-loading-icon" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="gsp-page gsp-center">
        <FiAlertCircle className="gsp-notfound-icon" />
        <h2>Không tìm thấy nhóm</h2>
        <p>Nhóm với mã "{code}" không tồn tại hoặc đã bị xoá.</p>
        <Link to="/" className="btn-ink">Về trang chủ</Link>
      </div>
    );
  }

  const isLocked = group.is_locked;

  return (
    <div className="gsp-page animate-slide-up">
      <ToastContainer position="bottom-right" theme="colored" />

      <div className="gsp-header">
        <div className="gsp-header-left">
          <div className="gsp-hero-badge"><FiUsers /> {isLocked ? 'ĐÃ CHỐT' : 'ĐANG MỞ'}</div>
          <h1 className="gsp-group-title">{group.title}</h1>
        </div>
        <button className="gsp-copy-btn" onClick={copyLink}>
          <FiCopy /> Copy link mời
        </button>
      </div>

      <div className="gsp-layout">
        {/* Member list + running total */}
        <div className="gsp-card">
          <div className="gsp-card-header">
            <h3>Thành viên ({group.member_count})</h3>
            <span className="gsp-total">Tổng: {fmt(group.total_spent)}</span>
          </div>
          <div className="gsp-member-list">
            {group.members.length === 0 && (
              <p className="gsp-empty">Chưa có ai tham gia. Hãy là người đầu tiên!</p>
            )}
            {group.members.map((m) => (
              <div key={m.member_id} className={`gsp-member-row ${m.member_id === memberId ? 'is-me' : ''}`}>
                <span className="gsp-member-name">{m.name}{m.member_id === memberId && ' (bạn)'}</span>
                {m.weight !== 1 && <span className="gsp-member-weight">×{m.weight}</span>}
                <span className="gsp-member-amount">{fmt(m.amount_spent)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: form or settlement */}
        <div className="gsp-card">
          {isLocked ? (
            <>
              <h3>Kết quả chia tiền</h3>
              {group.settlement.length === 0 ? (
                <p className="gsp-empty">Mọi người đã chi đều nhau — không cần chuyển khoản!</p>
              ) : (
                <div className="gsp-settlement-list">
                  {group.settlement.map((s, i) => (
                    <div key={i} className="gsp-settlement-row">
                      <span className="gsp-settle-from">{s.from_name}</span>
                      <FiArrowRight className="gsp-settle-arrow" />
                      <span className="gsp-settle-to">{s.to_name}</span>
                      <span className="gsp-settle-amount">{fmt(s.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="gsp-balance-detail">
                <h4>Chi tiết từng người</h4>
                {group.members.map((m) => {
                  const totalWeight = group.members.reduce((s, x) => s + (x.weight || 1), 0) || 1;
                  const fairShare = group.total_spent * ((m.weight || 1) / totalWeight);
                  const balance = m.amount_spent - fairShare;
                  return (
                    <div key={m.member_id} className="gsp-balance-row">
                      <span>{m.name}</span>
                      <span className="gsp-balance-mid">đã chi {fmt(m.amount_spent)} / cần chi {fmt(fairShare)}</span>
                      <span className={`gsp-balance-val ${balance >= 0 ? 'positive' : 'negative'}`}>
                        {balance >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                        {balance >= 0 ? `+${fmt(balance)}` : `-${fmt(Math.abs(balance))}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : myMember && !editing ? (
            <>
              <h3>Bạn đã gửi chi tiêu</h3>
              <div className="gsp-my-entry">
                <span>{myMember.name}</span>
                <strong>{fmt(myMember.amount_spent)}</strong>
              </div>
              <button className="btn-outline gsp-edit-btn" onClick={startEdit}>
                <FiEdit2 /> Sửa lại
              </button>
              <button className="btn-ink gsp-finalize-btn" onClick={handleFinalize} disabled={submitting}>
                {submitting ? <FiLoader className="spin" /> : <FiLock />} Chốt nhóm
              </button>
              <p className="gsp-hint">Chốt khi mọi người đã gửi xong chi tiêu của mình.</p>
            </>
          ) : (
            <>
              <h3>{editing ? 'Sửa chi tiêu của bạn' : 'Tham gia nhóm'}</h3>
              <label className="gsp-label">Tên của bạn</label>
              <input className="gsp-input" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Trung" disabled={editing} />

              <label className="gsp-label">Số tiền đã chi</label>
              <input className="gsp-input" type="number" min="0" value={amount}
                onChange={(e) => setAmount(e.target.value)} placeholder="0" />

              <label className="gsp-checkbox-label">
                <input type="checkbox" checked={useWeight} onChange={(e) => setUseWeight(e.target.checked)} />
                Đặt tỉ trọng riêng (mặc định chia đều)
              </label>
              {useWeight && (
                <input className="gsp-input" type="number" min="0.1" step="0.1" value={weight}
                  onChange={(e) => setWeight(e.target.value)} placeholder="1" />
              )}

              <button className="btn-ink gsp-submit-btn"
                onClick={editing ? handleUpdate : handleSubmit} disabled={submitting}>
                {submitting ? <FiLoader className="spin" /> : <FiCheck />}
                {editing ? ' Lưu thay đổi' : ' Gửi chi tiêu'}
              </button>
              {editing && (
                <button className="btn-outline gsp-cancel-btn" onClick={() => setEditing(false)}>Huỷ</button>
              )}

              {group.members.length > 0 && !editing && (
                <button className="btn-ink gsp-finalize-btn" onClick={handleFinalize} disabled={submitting}>
                  <FiLock /> Chốt nhóm ngay
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SplitGroupPage;
