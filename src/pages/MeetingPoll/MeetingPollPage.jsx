import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../services/axiosClient';
import {
  FiCalendar, FiCopy, FiLoader, FiLock, FiCheck,
  FiAlertCircle, FiKey, FiCheckCircle,
} from 'react-icons/fi';
import { HelpPanel, HelpSteps, HelpTip, FieldHint } from '../../components/ui/HelpPanel';
import './MeetingPoll.css';

const POLL_MS = 4000;

function MeetingPollPage() {
  const { code } = useParams();
  const identityKey = `meeting_identity_${code}`;

  const [groupPassword, setGroupPassword] = useState('');
  const [gateError, setGateError] = useState('');
  const [gateSubmitting, setGateSubmitting] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const [poll, setPoll] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [identity, setIdentity] = useState(() => {
    try { return JSON.parse(localStorage.getItem(identityKey)) || null; }
    catch { return null; }
  });

  const [joinName, setJoinName] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joining, setJoining] = useState(false);

  const [claimingName, setClaimingName] = useState(null);
  const [claimPassword, setClaimPassword] = useState('');
  const [claiming, setClaiming] = useState(false);

  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [savingAvail, setSavingAvail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const pollRef = useRef(null);

  const fetchPoll = useCallback(async (pw) => {
    try {
      const res = await axiosClient.get(`/meeting/polls/${code}`, { params: { group_password: pw } });
      setPoll(res.data);
      setNotFound(false);
      return true;
    } catch (error) {
      if (error.response?.status === 404) setNotFound(true);
      if (error.response?.status === 403) return false;
      return true;
    }
  }, [code]);

  const handleGateSubmit = async () => {
    if (!groupPassword.trim()) { setGateError('Vui lòng nhập mật khẩu.'); return; }
    setGateSubmitting(true);
    setGateError('');
    const ok = await fetchPoll(groupPassword.trim());
    setGateSubmitting(false);
    if (ok) setUnlocked(true);
    else setGateError('Sai mật khẩu hoặc lịch hẹn không tồn tại.');
  };

  useEffect(() => {
    if (!unlocked) return;
    pollRef.current = setInterval(() => fetchPoll(groupPassword), POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [unlocked, groupPassword, fetchPoll]);

  useEffect(() => {
    if (poll && identity && poll.availabilities[identity.member_id]) {
      setSelectedSlots(new Set(poll.availabilities[identity.member_id]));
    }
  }, [poll, identity]);

  const handleJoin = async () => {
    if (!joinName.trim()) { toast.warn('Vui lòng nhập tên.'); return; }
    if (joinPassword.trim().length < 4) { toast.warn('Mật khẩu phải có ít nhất 4 ký tự.'); return; }

    setJoining(true);
    try {
      const res = await axiosClient.post(`/meeting/polls/${code}/members`, {
        group_password: groupPassword, name: joinName.trim(), name_password: joinPassword,
      });
      const { member_id, ...pollData } = res.data;
      const newIdentity = { member_id, name_password: joinPassword };
      localStorage.setItem(identityKey, JSON.stringify(newIdentity));
      setIdentity(newIdentity);
      setPoll(pollData);
      toast.success('Đã tham gia!');
    } catch (error) {
      if (error.response?.status === 409 && error.response.data?.name_exists) {
        setClaimingName(joinName.trim());
      } else {
        toast.error(error.response?.data?.error || 'Không thể tham gia.');
      }
    } finally {
      setJoining(false);
    }
  };

  const handleClaim = async () => {
    const existing = poll.members.find(m => m.name.trim().toLowerCase() === claimingName.toLowerCase());
    if (!existing) return;
    setClaiming(true);
    try {
      const res = await axiosClient.post(`/meeting/polls/${code}/members/${existing.member_id}/verify`, {
        group_password: groupPassword, name_password: claimPassword,
      });
      const newIdentity = { member_id: res.data.member_id, name_password: claimPassword };
      localStorage.setItem(identityKey, JSON.stringify(newIdentity));
      setIdentity(newIdentity);
      setClaimingName(null);
      setClaimPassword('');
      toast.success('Xác nhận thành công!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Sai mật khẩu.');
    } finally {
      setClaiming(false);
    }
  };

  const toggleSlot = (slotId) => {
    setSelectedSlots(prev => {
      const next = new Set(prev);
      if (next.has(slotId)) next.delete(slotId);
      else next.add(slotId);
      return next;
    });
  };

  const saveAvailability = async () => {
    setSavingAvail(true);
    try {
      const res = await axiosClient.post(`/meeting/polls/${code}/availability`, {
        group_password: groupPassword, member_id: identity.member_id,
        name_password: identity.name_password, slot_ids: Array.from(selectedSlots),
      });
      setPoll(res.data);
      toast.success('Đã lưu lịch rảnh của bạn!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Không thể lưu.');
    } finally {
      setSavingAvail(false);
    }
  };

  const handleFinalize = async (slotId = null) => {
    setSubmitting(true);
    try {
      const body = { group_password: groupPassword };
      if (slotId) body.chosen_slot_id = slotId;
      const res = await axiosClient.post(`/meeting/polls/${code}/finalize`, body);
      setPoll(res.data);
      toast.success('Đã chốt lịch hẹn!');
    } catch (error) {
      toast.error('Không thể chốt lịch hẹn.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã copy link!');
  };

  if (!unlocked) {
    return (
      <div className="mtp-page mtp-center">
        <ToastContainer position="bottom-right" theme="colored" />
        <div className="mtp-card mtp-gate-card">
          <div className="mtp-hero-badge"><FiKey /> LỊCH HẸN RIÊNG TƯ</div>
          <h3>Nhập mật khẩu</h3>
          <p className="mtp-hint">Hỏi người tạo để lấy mật khẩu truy cập.</p>
          <input className="mtp-input" type="text" placeholder="Mật khẩu"
            value={groupPassword} onChange={(e) => setGroupPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGateSubmit()} autoFocus />
          {gateError && <p className="mtp-error-text"><FiAlertCircle /> {gateError}</p>}
          <button className="btn-ink mtp-submit-btn" onClick={handleGateSubmit} disabled={gateSubmitting}>
            {gateSubmitting ? <FiLoader className="spin" /> : <FiCheck />} Vào lịch hẹn
          </button>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mtp-page mtp-center">
        <FiAlertCircle className="mtp-notfound-icon" />
        <h2>Không tìm thấy lịch hẹn</h2>
        <p>Mã "{code}" không tồn tại hoặc đã bị xoá.</p>
        <Link to="/" className="btn-ink">Về trang chủ</Link>
      </div>
    );
  }

  if (!poll) {
    return <div className="mtp-page mtp-center"><FiLoader className="spin mtp-loading-icon" /></div>;
  }

  const isLocked = poll.is_locked;
  const dates = [...new Set(poll.slots.map(s => s.date))];
  const timeLabels = [...new Set(poll.slots.map(s => s.time_label))];
  const slotByKey = {};
  poll.slots.forEach(s => { slotByKey[`${s.date}|${s.time_label}`] = s; });
  const maxCount = Math.max(1, ...poll.slots.map(s => s.available_count));
  const chosenSlot = poll.slots.find(s => s.slot_id === poll.chosen_slot_id);

  return (
    <div className="mtp-page animate-slide-up">
      <ToastContainer position="bottom-right" theme="colored" />

      <div className="mtp-header">
        <div className="mtp-header-left">
          <div className="mtp-hero-badge"><FiCalendar /> {isLocked ? 'ĐÃ CHỐT' : 'ĐANG MỞ'}</div>
          <h1 className="mtp-group-title">{poll.title}</h1>
        </div>
        <button className="mtp-copy-btn" onClick={copyLink}><FiCopy /> Copy link mời</button>
      </div>

      {!identity && !isLocked && !claimingName && (
        <div className="mtp-card mtp-join-card">
          <h3>Tham gia</h3>
          <div className="mtp-join-row">
            <input className="mtp-input" placeholder="Tên của bạn" value={joinName} onChange={(e) => setJoinName(e.target.value)} />
            <input className="mtp-input" type="password" placeholder="Đặt mật khẩu cho tên này"
              value={joinPassword} onChange={(e) => setJoinPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()} />
            <button className="btn-ink mtp-join-btn" onClick={handleJoin} disabled={joining}>
              {joining ? <FiLoader className="spin" /> : <FiCheck />} Tham gia
            </button>
          </div>
        </div>
      )}

      {claimingName && (
        <div className="mtp-card mtp-join-card">
          <h3>Xác nhận danh tính "{claimingName}"</h3>
          <div className="mtp-join-row">
            <input className="mtp-input" type="password" placeholder="Mật khẩu của bạn"
              value={claimPassword} onChange={(e) => setClaimPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleClaim()} autoFocus />
            <button className="btn-ink mtp-join-btn" onClick={handleClaim} disabled={claiming}>
              {claiming ? <FiLoader className="spin" /> : <FiCheck />} Xác nhận
            </button>
            <button className="btn-outline" onClick={() => { setClaimingName(null); setClaimPassword(''); }}>Huỷ</button>
          </div>
        </div>
      )}

      {!isLocked && (
        <HelpPanel>
          <HelpSteps steps={[
            <>Trên lưới dưới đây, mỗi ô là 1 khung giờ/ngày — <strong>click để chọn ô mình rảnh</strong>, click lần nữa để hủy.</>,
            <>Màu ô càng tím đậm = càng nhiều người cùng rảnh khung đó — bạn có thể dùng thông tin này để ưu tiên chọn giờ đông người hơn.</>,
            <>Sau khi chọn xong, nhấn <strong>"Lưu lịch rảnh của tôi"</strong> — chọn lại bất kỳ lúc nào trước khi chốt.</>,
            <>Khi mọi người đã lưu xong, bấm <strong>"Chốt lịch hẹn"</strong> — hệ thống tự chọn khung giờ có nhiều người rảnh nhất.</>,
          ]} />
          <HelpTip>Mỗi người chỉ cần tick giờ MÌNH rảnh, không cần quan tâm người khác chọn gì — thuật toán tự tìm giao điểm chung tốt nhất.</HelpTip>
        </HelpPanel>
      )}

      {isLocked && chosenSlot ? (
        <div className="mtp-card mtp-chosen-card">
          <h3><FiCheckCircle /> Lịch đã chốt</h3>
          <div className="mtp-chosen-slot">
            <span className="mtp-chosen-date">{chosenSlot.date}</span>
            <span className="mtp-chosen-time">{chosenSlot.time_label}</span>
            <span className="mtp-chosen-count">{chosenSlot.available_count}/{poll.member_count} người rảnh</span>
          </div>
        </div>
      ) : (
        <div className="mtp-card">
          <h3>Lưới khung giờ rảnh {isLocked ? '(đã khoá)' : ''}</h3>
          <p className="mtp-hint">Màu càng đậm = càng nhiều người rảnh. {identity && !isLocked && 'Click ô để chọn giờ bạn rảnh.'}</p>
          <div className="mtp-grid-wrap">
            <table className="mtp-grid">
              <thead>
                <tr>
                  <th></th>
                  {dates.map(d => <th key={d}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {timeLabels.map(label => (
                  <tr key={label}>
                    <td className="mtp-grid-time-label">{label}</td>
                    {dates.map(date => {
                      const slot = slotByKey[`${date}|${label}`];
                      if (!slot) return <td key={date}></td>;
                      const intensity = slot.available_count / maxCount;
                      const isMine = identity && selectedSlots.has(slot.slot_id);
                      const isChosen = slot.slot_id === poll.chosen_slot_id;
                      return (
                        <td key={date}
                          className={`mtp-grid-cell ${isMine ? 'mine' : ''} ${isChosen ? 'chosen' : ''} ${identity && !isLocked ? 'clickable' : ''}`}
                          style={{ '--intensity': intensity }}
                          onClick={() => identity && !isLocked && toggleSlot(slot.slot_id)}
                          title={`${slot.available_count} người rảnh`}
                        >
                          {slot.available_count > 0 && slot.available_count}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {identity && !isLocked && (
            <button className="btn-ink mtp-submit-btn" onClick={saveAvailability} disabled={savingAvail}>
              {savingAvail ? <FiLoader className="spin" /> : <FiCheck />} Lưu lịch rảnh của tôi
            </button>
          )}
        </div>
      )}

      {!isLocked && poll.member_count > 0 && (
        <button className="btn-ink mtp-finalize-btn" onClick={() => handleFinalize()} disabled={submitting}>
          {submitting ? <FiLoader className="spin" /> : <FiLock />} Chốt lịch hẹn (chọn giờ đông nhất)
        </button>
      )}

      <div className="mtp-card">
        <h3>Thành viên ({poll.member_count})</h3>
        <div className="mtp-member-list">
          {poll.members.length === 0 && <p className="mtp-hint">Chưa có ai tham gia.</p>}
          {poll.members.map(m => (
            <span key={m.member_id} className={`mtp-member-chip ${m.member_id === identity?.member_id ? 'is-me' : ''}`}>
              {m.name}{m.member_id === identity?.member_id && ' (bạn)'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MeetingPollPage;
