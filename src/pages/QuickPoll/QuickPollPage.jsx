import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../services/axiosClient';
import { FiBarChart2, FiCopy, FiLoader, FiLock, FiCheck, FiAlertCircle, FiUsers } from 'react-icons/fi';
import { HelpPanel, HelpSteps, HelpTip } from '../../components/ui/HelpPanel';
import './QuickPoll.css';

const POLL_MS = 3000;

function getVoterId(code) {
  const key = `poll_voter_${code}`;
  let id = localStorage.getItem(key);
  if (!id) {
    id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

function QuickPollPage() {
  const { code } = useParams();
  const voterId = getVoterId(code);

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selected, setSelected] = useState([]);
  const [hasVoted, setHasVoted] = useState(() => localStorage.getItem(`poll_voted_${code}`) === '1');
  const [submitting, setSubmitting] = useState(false);
  const pollRef = useRef(null);

  const fetchPoll = useCallback(async () => {
    try {
      const res = await axiosClient.get(`/poll/polls/${code}`);
      setPoll(res.data);
      setNotFound(false);
    } catch (error) {
      if (error.response?.status === 404) setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchPoll();
    pollRef.current = setInterval(fetchPoll, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [fetchPoll]);

  const toggleOption = (optionId) => {
    if (poll.allow_multiple) {
      setSelected(prev => prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]);
    } else {
      setSelected([optionId]);
    }
  };

  const handleVote = async () => {
    if (selected.length === 0) { toast.warn('Vui lòng chọn ít nhất 1 lựa chọn.'); return; }
    setSubmitting(true);
    try {
      const res = await axiosClient.post(`/poll/polls/${code}/vote`, {
        voter_id: voterId, option_ids: selected,
      });
      setPoll(res.data);
      setHasVoted(true);
      localStorage.setItem(`poll_voted_${code}`, '1');
      toast.success('Đã ghi nhận bình chọn của bạn!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Không thể vote.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    try {
      const res = await axiosClient.post(`/poll/polls/${code}/close`);
      setPoll(res.data);
      toast.success('Đã đóng bình chọn.');
    } catch {
      toast.error('Không thể đóng bình chọn.');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã copy link!');
  };

  if (loading) {
    return <div className="qpl-page qpl-center"><FiLoader className="spin qpl-loading-icon" /></div>;
  }

  if (notFound) {
    return (
      <div className="qpl-page qpl-center">
        <FiAlertCircle className="qpl-notfound-icon" />
        <h2>Không tìm thấy bình chọn</h2>
        <p>Mã "{code}" không tồn tại hoặc đã bị xoá.</p>
        <Link to="/" className="btn-ink">Về trang chủ</Link>
      </div>
    );
  }

  const maxCount = Math.max(1, ...poll.options.map(o => o.count));
  const showResults = hasVoted || poll.is_closed;

  return (
    <div className="qpl-page animate-slide-up">
      <ToastContainer position="bottom-right" theme="colored" />

      <div className="qpl-header">
        <div className="qpl-hero-badge"><FiBarChart2 /> {poll.is_closed ? 'ĐÃ ĐÓNG' : 'ĐANG MỞ'}</div>
        <button className="qpl-copy-btn" onClick={copyLink}><FiCopy /> Copy link</button>
      </div>

      {!poll.is_closed && (
        <HelpPanel>
          <HelpSteps steps={[
            <>Chọn 1 hoặc nhiều đáp án bên dưới rồi nhấn <strong>"Gửi bình chọn"</strong>.</>,
            <>Sau khi gửi, bạn sẽ thấy ngay kết quả phần trăm theo từng đáp án — cập nhật tự động mỗi vài giây khi có người khác vote.</>,
            <>Muốn đổi lựa chọn? Chỉ cần chọn đáp án mới và gửi lại — lựa chọn cũ bị ghi đè, không cộng dồn.</>,
            <>Bất kỳ ai cũng bấm được <strong>"Đóng bình chọn"</strong> để khóa kết quả cuối cùng.</>,
          ]} />
          <HelpTip>Không cần đăng nhập, không cần cài app — chỉ cần link là vote được ngay. Hệ thống nhớ bạn qua trình duyệt (cùng thiết bị/trình duyệt = cùng 1 người).</HelpTip>
        </HelpPanel>
      )}

      <div className="qpl-card">
        <h1 className="qpl-question">{poll.question}</h1>
        <div className="qpl-meta-row">
          <span><FiUsers /> {poll.unique_voters} người đã vote</span>
          {poll.allow_multiple && <span className="qpl-multi-tag">Chọn nhiều đáp án</span>}
        </div>

        {!showResults ? (
          <div className="qpl-options-form">
            {poll.options.map((opt) => (
              <button
                key={opt.option_id}
                className={`qpl-option-btn ${selected.includes(opt.option_id) ? 'selected' : ''}`}
                onClick={() => toggleOption(opt.option_id)}
              >
                <span className={`qpl-option-check ${poll.allow_multiple ? 'square' : 'round'}`}>
                  {selected.includes(opt.option_id) && <FiCheck />}
                </span>
                {opt.label}
              </button>
            ))}
            <button className="btn-ink qpl-vote-btn" onClick={handleVote} disabled={submitting}>
              {submitting ? <FiLoader className="spin" /> : <FiCheck />} Gửi bình chọn
            </button>
          </div>
        ) : (
          <div className="qpl-results">
            {poll.options.map((opt) => (
              <div key={opt.option_id} className="qpl-result-row">
                <div className="qpl-result-label-row">
                  <span className="qpl-result-label">{opt.label}</span>
                  <span className="qpl-result-pct">{opt.percent}% ({opt.count})</span>
                </div>
                <div className="qpl-result-bar-track">
                  <div className="qpl-result-bar-fill" style={{ width: `${(opt.count / maxCount) * 100}%` }} />
                </div>
              </div>
            ))}
            {hasVoted && !poll.is_closed && <p className="qpl-hint">Bạn đã vote — kết quả cập nhật real-time.</p>}
          </div>
        )}

        {!poll.is_closed && (
          <button className="btn-outline qpl-close-btn" onClick={handleClose}>
            <FiLock /> Đóng bình chọn
          </button>
        )}
      </div>
    </div>
  );
}

export default QuickPollPage;
