import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../services/axiosClient';
import {
  FiUsers, FiCopy, FiLoader, FiLock, FiPlus, FiTrash2, FiCheck,
  FiArrowRight, FiAlertCircle, FiTrendingUp, FiTrendingDown, FiTag, FiKey,
} from 'react-icons/fi';
import { HelpPanel, HelpSteps, HelpTip, FieldHint } from '../../components/ui/HelpPanel';
import './GroupSplit.css';

const POLL_MS = 4000;
const fmt = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0)) + 'đ';

function SplitGroupPage() {
  const { code } = useParams();
  const identityKey = `split_identity_${code}`; // { member_id, name_password }

  const [groupPassword, setGroupPassword] = useState('');
  const [gateError, setGateError] = useState('');
  const [gateSubmitting, setGateSubmitting] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [identity, setIdentity] = useState(() => {
    try { return JSON.parse(localStorage.getItem(identityKey)) || null; }
    catch { return null; }
  });

  const [joinName, setJoinName] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joining, setJoining] = useState(false);

  const [claimingName, setClaimingName] = useState(null); // name string currently being claimed
  const [claimPassword, setClaimPassword] = useState('');
  const [claiming, setClaiming] = useState(false);

  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expPaidBy, setExpPaidBy] = useState('');
  const [expPayerPassword, setExpPayerPassword] = useState('');
  const [expParticipants, setExpParticipants] = useState([]);
  const [addingExpense, setAddingExpense] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const pollRef = useRef(null);

  const fetchGroup = useCallback(async (pw) => {
    try {
      const res = await axiosClient.get(`/split/groups/${code}`, { params: { group_password: pw } });
      setGroup(res.data);
      setNotFound(false);
      return true;
    } catch (error) {
      if (error.response?.status === 404) setNotFound(true);
      if (error.response?.status === 403) return false;
      return true; // transient error, don't lock user out
    }
  }, [code]);

  const handleGateSubmit = async () => {
    if (!groupPassword.trim()) { setGateError('Vui lòng nhập mật khẩu nhóm.'); return; }
    setGateSubmitting(true);
    setGateError('');
    const ok = await fetchGroup(groupPassword.trim());
    setGateSubmitting(false);
    if (ok) {
      setUnlocked(true);
    } else {
      setGateError('Sai mật khẩu nhóm hoặc nhóm không tồn tại.');
    }
  };

  useEffect(() => {
    if (!unlocked) return;
    pollRef.current = setInterval(() => fetchGroup(groupPassword), POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [unlocked, groupPassword, fetchGroup]);

  useEffect(() => {
    if (group && group.members.length && !expPaidBy) {
      setExpPaidBy(identity?.member_id || group.members[0].member_id);
    }
  }, [group, identity, expPaidBy]);

  const myMember = group?.members?.find(m => m.member_id === identity?.member_id) || null;

  const handleJoin = async () => {
    if (!joinName.trim()) { toast.warn('Vui lòng nhập tên.'); return; }
    if (joinPassword.trim().length < 4) { toast.warn('Mật khẩu tên phải có ít nhất 4 ký tự.'); return; }

    setJoining(true);
    try {
      const res = await axiosClient.post(`/split/groups/${code}/members`, {
        group_password: groupPassword, name: joinName.trim(), name_password: joinPassword,
      });
      const { member_id, ...groupData } = res.data;
      const newIdentity = { member_id, name_password: joinPassword };
      localStorage.setItem(identityKey, JSON.stringify(newIdentity));
      setIdentity(newIdentity);
      setGroup(groupData);
      toast.success('Đã tham gia nhóm!');
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
    const existing = group.members.find(m => m.name.trim().toLowerCase() === claimingName.toLowerCase());
    if (!existing) return;
    if (!claimPassword.trim()) { toast.warn('Vui lòng nhập mật khẩu.'); return; }

    setClaiming(true);
    try {
      const res = await axiosClient.post(`/split/groups/${code}/members/${existing.member_id}/verify`, {
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

  const toggleParticipant = (mid) => {
    setExpParticipants(prev =>
      prev.includes(mid) ? prev.filter(x => x !== mid) : [...prev, mid]
    );
  };

  const selectAllParticipants = () => {
    setExpParticipants(group.members.map(m => m.member_id));
  };

  const resetExpenseForm = () => {
    setExpDesc('');
    setExpAmount('');
    setExpParticipants([]);
    setExpPayerPassword('');
  };

  const isPayerMe = expPaidBy === identity?.member_id;

  const handleAddExpense = async () => {
    if (!expDesc.trim()) { toast.warn('Vui lòng nhập tên khoản chi.'); return; }
    const amt = parseFloat(expAmount);
    if (isNaN(amt) || amt <= 0) { toast.warn('Số tiền không hợp lệ.'); return; }
    if (!expPaidBy) { toast.warn('Vui lòng chọn người trả.'); return; }
    if (expParticipants.length === 0) { toast.warn('Chọn ít nhất 1 người tham gia chia khoản này.'); return; }

    const payerPassword = isPayerMe ? identity.name_password : expPayerPassword;
    if (!payerPassword) { toast.warn('Vui lòng nhập mật khẩu của người trả.'); return; }

    setAddingExpense(true);
    try {
      const res = await axiosClient.post(`/split/groups/${code}/expenses`, {
        group_password: groupPassword, description: expDesc.trim(), amount: amt,
        paid_by: expPaidBy, payer_password: payerPassword, participants: expParticipants,
      });
      const { expense_id, ...groupData } = res.data;
      setGroup(groupData);
      resetExpenseForm();
      toast.success('Đã thêm khoản chi!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Không thể thêm khoản chi.');
    } finally {
      setAddingExpense(false);
    }
  };

  const handleDeleteExpense = async (expense) => {
    const isMine = expense.paid_by === identity?.member_id;
    let payerPassword = isMine ? identity.name_password : null;
    if (!payerPassword) {
      payerPassword = window.prompt(`Nhập mật khẩu của ${nameOf(expense.paid_by)} để xoá khoản chi này:`);
      if (!payerPassword) return;
    }
    try {
      const res = await axiosClient.delete(`/split/groups/${code}/expenses/${expense.expense_id}`, {
        data: { group_password: groupPassword, payer_password: payerPassword },
      });
      setGroup(res.data);
      toast.success('Đã xoá khoản chi.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Không thể xoá.');
    }
  };

  const handleFinalize = async () => {
    setSubmitting(true);
    try {
      const res = await axiosClient.post(`/split/groups/${code}/finalize`, { group_password: groupPassword });
      setGroup(res.data);
      toast.success('Đã chốt nhóm!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Không thể chốt nhóm.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã copy link!');
  };

  const nameOf = (mid) => group?.members?.find(m => m.member_id === mid)?.name || '?';

  // ── Password gate ──
  if (!unlocked) {
    return (
      <div className="gsp-page gsp-center">
        <ToastContainer position="bottom-right" theme="colored" />
        <div className="gsp-card gsp-gate-card">
          <div className="gsp-hero-badge"><FiKey /> NHÓM RIÊNG TƯ</div>
          <h3>Nhập mật khẩu nhóm</h3>
          <p className="gsp-hint">Hỏi người tạo nhóm để lấy mật khẩu truy cập.</p>
          <input
            className="gsp-input" type="text" placeholder="Mật khẩu nhóm"
            value={groupPassword} onChange={(e) => setGroupPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGateSubmit()}
            autoFocus
          />
          {gateError && <p className="gsp-error-text"><FiAlertCircle /> {gateError}</p>}
          <button className="btn-ink gsp-submit-btn" onClick={handleGateSubmit} disabled={gateSubmitting}>
            {gateSubmitting ? <FiLoader className="spin" /> : <FiCheck />} Vào nhóm
          </button>
        </div>
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

  if (!group) {
    return (
      <div className="gsp-page gsp-center">
        <FiLoader className="spin gsp-loading-icon" />
      </div>
    );
  }

  const isLocked = group.is_locked;
  const balances = (() => {
    const b = {};
    group.members.forEach(m => { b[m.member_id] = 0; });
    group.expenses.forEach(e => {
      b[e.paid_by] = (b[e.paid_by] || 0) + e.amount;
      const share = e.amount / (e.participants.length || 1);
      e.participants.forEach(pid => { b[pid] = (b[pid] || 0) - share; });
    });
    return b;
  })();

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

      {!identity && !isLocked && !claimingName && (
        <div className="gsp-card gsp-join-card">
          <h3>Tham gia nhóm</h3>
          <div className="gsp-join-row">
            <input className="gsp-input" placeholder="Tên của bạn"
              value={joinName} onChange={(e) => setJoinName(e.target.value)} />
            <input className="gsp-input" type="password" placeholder="Đặt mật khẩu cho tên này"
              value={joinPassword} onChange={(e) => setJoinPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()} />
            <button className="btn-ink gsp-join-btn" onClick={handleJoin} disabled={joining}>
              {joining ? <FiLoader className="spin" /> : <FiCheck />} Tham gia
            </button>
          </div>
          <p className="gsp-hint">Nhớ mật khẩu này để sửa lại chi tiêu của bạn sau này.</p>
        </div>
      )}

      {claimingName && (
        <div className="gsp-card gsp-join-card">
          <h3>Xác nhận danh tính "{claimingName}"</h3>
          <p className="gsp-hint">Tên này đã tồn tại. Nếu đó là bạn, nhập mật khẩu đã đặt trước đó.</p>
          <div className="gsp-join-row">
            <input className="gsp-input" type="password" placeholder="Mật khẩu của bạn"
              value={claimPassword} onChange={(e) => setClaimPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleClaim()} autoFocus />
            <button className="btn-ink gsp-join-btn" onClick={handleClaim} disabled={claiming}>
              {claiming ? <FiLoader className="spin" /> : <FiCheck />} Xác nhận
            </button>
            <button className="btn-outline" onClick={() => { setClaimingName(null); setClaimPassword(''); }}>Huỷ</button>
          </div>
        </div>
      )}

      <div className="gsp-layout">
        {/* Members */}
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
              <div key={m.member_id} className={`gsp-member-row ${m.member_id === identity?.member_id ? 'is-me' : ''}`}>
                <span className="gsp-member-name">{m.name}{m.member_id === identity?.member_id && ' (bạn)'}</span>
                <span className={`gsp-member-amount ${balances[m.member_id] >= 0 ? 'positive' : 'negative'}`}>
                  {balances[m.member_id] >= 0 ? '+' : ''}{fmt(balances[m.member_id])}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses / Settlement */}
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
            </>
          ) : (
            <>
              <h3>Khoản chi tiêu</h3>
              <div className="gsp-expense-list">
                {group.expenses.length === 0 && (
                  <p className="gsp-empty">Chưa có khoản chi nào.</p>
                )}
                {group.expenses.map((e) => (
                  <div key={e.expense_id} className="gsp-expense-row">
                    <div className="gsp-expense-main">
                      <span className="gsp-expense-desc"><FiTag /> {e.description}</span>
                      <span className="gsp-expense-amount">{fmt(e.amount)}</span>
                    </div>
                    <div className="gsp-expense-meta">
                      <span>{nameOf(e.paid_by)} trả · chia cho {e.participants.map(nameOf).join(', ')}</span>
                      <button className="gsp-expense-del" onClick={() => handleDeleteExpense(e)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {group.members.length >= 1 && (
                <div className="gsp-add-expense">
                  <label className="gsp-label">Tên khoản chi</label>
                  <input className="gsp-input" placeholder="Ví dụ: Ăn tối, tiền xăng..."
                    value={expDesc} onChange={(e) => setExpDesc(e.target.value)} />

                  <label className="gsp-label">Số tiền</label>
                  <input className="gsp-input" type="number" min="0" placeholder="0"
                    value={expAmount} onChange={(e) => setExpAmount(e.target.value)} />

                  <label className="gsp-label">
                    Ai đã trả
                    <FieldHint text="Chọn tên người thực sự bỏ tiền cho khoản này. Nếu chọn người khác (không phải bạn), sẽ phải nhập mật khẩu của họ để xác nhận — không ai giả danh người khác được." />
                  </label>
                  <select className="gsp-input" value={expPaidBy} onChange={(e) => setExpPaidBy(e.target.value)}>
                    {group.members.map(m => (
                      <option key={m.member_id} value={m.member_id}>{m.name}</option>
                    ))}
                  </select>

                  {!isPayerMe && expPaidBy && (
                    <>
                      <label className="gsp-label">Mật khẩu của {nameOf(expPaidBy)}</label>
                      <input className="gsp-input" type="password" placeholder="Bắt buộc để xác nhận"
                        value={expPayerPassword} onChange={(e) => setExpPayerPassword(e.target.value)} />
                    </>
                  )}

                  <div className="gsp-field-header">
                    <label className="gsp-label">
                      Chia cho ai
                      <FieldHint text="Tick những người cùng tham gia chi trả cho khoản này. Những ai không được tick sẽ KHÔNG bị tính tiền khoản này — ví dụ 1 người không uống bia thì đừng tick họ vào khoản 'tiền bia'." />
                    </label>
                    <button className="gsp-select-all" onClick={selectAllParticipants}>Chọn tất cả</button>
                  </div>
                  <div className="gsp-participant-chips">
                    {group.members.map(m => (
                      <button
                        key={m.member_id}
                        className={`gsp-chip ${expParticipants.includes(m.member_id) ? 'active' : ''}`}
                        onClick={() => toggleParticipant(m.member_id)}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>

                  <button className="btn-ink gsp-submit-btn" onClick={handleAddExpense} disabled={addingExpense}>
                    {addingExpense ? <FiLoader className="spin" /> : <FiPlus />} Thêm khoản chi
                  </button>
                </div>
              )}

              {group.expenses.length > 0 && (
                <button className="btn-ink gsp-finalize-btn" onClick={handleFinalize} disabled={submitting}>
                  {submitting ? <FiLoader className="spin" /> : <FiLock />} Chốt nhóm
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {isLocked && (
        <div className="gsp-card">
          <h3>Chi tiết từng người</h3>
          <div className="gsp-balance-detail">
            {group.members.map((m) => (
              <div key={m.member_id} className="gsp-balance-row">
                <span>{m.name}</span>
                <span className={`gsp-balance-val ${balances[m.member_id] >= 0 ? 'positive' : 'negative'}`}>
                  {balances[m.member_id] >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                  {balances[m.member_id] >= 0 ? `+${fmt(balances[m.member_id])}` : `-${fmt(Math.abs(balances[m.member_id]))}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SplitGroupPage;
