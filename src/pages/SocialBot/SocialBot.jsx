import React, { useState, useEffect, useContext } from 'react';
import './SocialBot.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../services/axiosClient';
import { AuthContext } from '../../contexts/AuthContext';
import {
  FiLoader, FiSend, FiZap, FiFacebook, FiMessageCircle, FiTrash2,
  FiClock, FiCheckCircle, FiAlertTriangle, FiPlusCircle,
} from 'react-icons/fi';
import { HelpPanel, HelpSteps, HelpTip, HelpWarning } from '../../components/ui/HelpPanel';

const PLATFORMS = [
  { key: 'facebook', label: 'Facebook', icon: <FiFacebook /> },
  { key: 'zalo', label: 'Zalo OA', icon: <FiMessageCircle /> },
];

const STATUS_META = {
  draft:     { label: 'Nháp', icon: <FiClock />, cls: 'draft' },
  scheduled: { label: 'Đã lên lịch', icon: <FiClock />, cls: 'scheduled' },
  posted:    { label: 'Đã đăng', icon: <FiCheckCircle />, cls: 'posted' },
  failed:    { label: 'Thất bại', icon: <FiAlertTriangle />, cls: 'failed' },
};

function SocialBot() {
  const { refreshWallet } = useContext(AuthContext);
  const [connections, setConnections] = useState([]);
  const [posts, setPosts] = useState([]);
  const [platform, setPlatform] = useState('facebook');
  const [content, setContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [creating, setCreating] = useState(false);
  const [publishingId, setPublishingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [connRes, postsRes] = await Promise.all([
        axiosClient.get('/social/connections'),
        axiosClient.get('/social/posts'),
      ]);
      setConnections(connRes.data.connections);
      setPosts(postsRes.data.posts);
    } catch {
      toast.error('Không tải được dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    if (!content.trim()) { toast.warn('Vui lòng nhập nội dung bài đăng.'); return; }
    setCreating(true);
    try {
      const body = { platform, content: content.trim() };
      if (scheduledAt) body.scheduled_at = new Date(scheduledAt).toISOString();
      await axiosClient.post('/social/posts', body);
      setContent('');
      setScheduledAt('');
      toast.success('Đã tạo bài đăng!');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Không thể tạo bài đăng.');
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async (postId) => {
    setPublishingId(postId);
    try {
      const res = await axiosClient.post(`/social/posts/${postId}/publish`);
      toast.success('Đã đăng bài thành công!');
      refreshWallet();
      loadData();
    } catch (error) {
      const msg = error.response?.data?.error || 'Không thể đăng bài.';
      toast.error(msg);
      loadData();
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axiosClient.delete(`/social/posts/${postId}`);
      toast.success('Đã xóa.');
      loadData();
    } catch {
      toast.error('Không thể xóa.');
    }
  };

  const activePlatformConfigured = connections.find(c => c.platform === platform)?.api_configured;

  return (
    <div className="sbt-page animate-slide-up">
      <ToastContainer position="bottom-right" theme="colored" />

      <div className="sbt-hero">
        <div className="sbt-hero-badge"><FiSend /> SOCIAL MEDIA BOT</div>
        <h1 className="sbt-hero-title">Lên lịch <span className="sbt-hero-accent">đăng bài</span></h1>
        <p className="sbt-hero-desc">
          Soạn và quản lý bài đăng cho Facebook, Zalo OA từ một nơi duy nhất.
        </p>
      </div>

      <div className="sbt-connections-row">
        {connections.map((conn) => (
          <div key={conn.platform} className={`sbt-conn-card ${conn.api_configured ? '' : 'not-configured'}`}>
            {PLATFORMS.find(p => p.key === conn.platform)?.icon}
            <div className="sbt-conn-info">
              <span className="sbt-conn-name">{PLATFORMS.find(p => p.key === conn.platform)?.label}</span>
              <span className="sbt-conn-status">
                {conn.api_configured ? (conn.is_connected ? 'Đã kết nối' : 'Chưa liên kết tài khoản') : 'Chưa cấu hình API'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {!activePlatformConfigured && (
        <div className="sbt-warning-banner">
          <FiAlertTriangle />
          <span>
            Nền tảng này chưa được cấu hình OAuth thật (thiếu App ID/Secret phía server).
            Bạn vẫn có thể soạn và lưu bài đăng dạng nháp, nhưng thao tác "Đăng ngay" sẽ báo lỗi rõ ràng cho tới khi kết nối được cấu hình.
          </span>
        </div>
      )}

      <HelpPanel>
        <HelpSteps steps={[
          <>Chọn nền tảng (Facebook hoặc Zalo OA) ở tab trên cùng.</>,
          <>Nhập nội dung bài đăng (tối đa 5000 ký tự).</>,
          <>Tùy chọn: đặt thời gian lên lịch — để trống thì bài lưu dạng "Nháp".</>,
          <>Nhấn <strong>"Lưu bài đăng"</strong> — thao tác này miễn phí, không trừ credit.</>,
          <>Trong danh sách bài đăng bên dưới, nhấn <strong>"Đăng ngay"</strong> để publish thật lên nền tảng đã chọn.</>,
        ]} />
        <HelpTip>Xóa bài đăng bất kỳ lúc nào bằng nút thùng rác cạnh mỗi bài trong danh sách.</HelpTip>
        <HelpWarning>
          Đây là bản khung sườn quản lý bài đăng. Đăng thật lên Facebook/Zalo cần kết nối OAuth thật (App ID/Secret) — hiện <strong>chưa cấu hình</strong>, nên "Đăng ngay" sẽ báo lỗi rõ ràng thay vì giả vờ thành công. Bài lỗi hiện trạng thái "Thất bại" kèm lý do cụ thể.
        </HelpWarning>
      </HelpPanel>

      <div className="sbt-main">
        <div className="sbt-platform-tabs">
          {PLATFORMS.map((p) => (
            <button key={p.key} className={`sbt-platform-tab ${platform === p.key ? 'active' : ''}`}
              onClick={() => setPlatform(p.key)}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>

        <div className="sbt-field">
          <label className="sbt-label">Nội dung bài đăng</label>
          <textarea className="sbt-textarea" placeholder="Nhập nội dung bạn muốn đăng..."
            value={content} onChange={(e) => setContent(e.target.value)} maxLength={5000} />
        </div>

        <div className="sbt-field">
          <label className="sbt-label">Lên lịch (không bắt buộc — để trống để lưu nháp)</label>
          <input className="sbt-input" type="datetime-local" value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)} />
        </div>

        <div className="sbt-cost-row">
          <FiZap className="sbt-cost-icon" />
          <span>Chi phí: <strong>1 credit</strong> khi đăng thật (tạo nháp miễn phí)</span>
        </div>

        <button className="btn-ink sbt-submit" onClick={handleCreate} disabled={creating}>
          {creating ? <><FiLoader className="spin" /> Đang lưu...</> : <><FiPlusCircle /> Lưu bài đăng</>}
        </button>
      </div>

      <div className="sbt-card">
        <h3>Bài đăng của bạn ({posts.length})</h3>
        {loading ? (
          <p className="sbt-empty">Đang tải...</p>
        ) : posts.length === 0 ? (
          <p className="sbt-empty">Chưa có bài đăng nào.</p>
        ) : (
          <div className="sbt-post-list">
            {posts.map((post) => (
              <div key={post.id} className="sbt-post-item">
                <div className="sbt-post-header">
                  <span className="sbt-post-platform">
                    {PLATFORMS.find(p => p.key === post.platform)?.icon} {PLATFORMS.find(p => p.key === post.platform)?.label}
                  </span>
                  <span className={`sbt-post-status ${STATUS_META[post.status].cls}`}>
                    {STATUS_META[post.status].icon} {STATUS_META[post.status].label}
                  </span>
                </div>
                <p className="sbt-post-content">{post.content}</p>
                {post.scheduled_at && (
                  <p className="sbt-post-schedule">Lên lịch: {new Date(post.scheduled_at).toLocaleString('vi-VN')}</p>
                )}
                {post.error_message && (
                  <p className="sbt-post-error"><FiAlertTriangle /> {post.error_message}</p>
                )}
                <div className="sbt-post-actions">
                  {post.status !== 'posted' && (
                    <button className="btn-ink sbt-publish-btn" onClick={() => handlePublish(post.id)}
                      disabled={publishingId === post.id}>
                      {publishingId === post.id ? <FiLoader className="spin" /> : <FiSend />} Đăng ngay
                    </button>
                  )}
                  <button className="sbt-delete-btn" onClick={() => handleDelete(post.id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SocialBot;
