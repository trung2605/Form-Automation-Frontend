import React, { useState, useEffect } from 'react';
import axiosClient from '../../services/axiosClient';
import { FiUsers, FiDollarSign, FiActivity, FiShield, FiLock, FiUnlock, FiPlus, FiMinus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Admin.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'users', 'transactions'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // For modal actions
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(''); // 'add', 'deduct'
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'stats') {
        const res = await axiosClient.get('/admin/stats');
        setStats(res.data);
      } else if (tab === 'users') {
        const res = await axiosClient.get('/admin/users');
        setUsers(res.data);
      } else if (tab === 'transactions') {
        const res = await axiosClient.get('/admin/transactions');
        setTransactions(res.data);
      }
    } catch (err) {
      toast.error('Lỗi khi tải dữ liệu Admin: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (userId) => {
    try {
      const res = await axiosClient.post(`/admin/users/${userId}/toggle_ban`);
      toast.success(res.data.message);
      fetchData('users');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi khi khóa/mở tài khoản');
    }
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (amount <= 0) return;

    const endpoint = actionType === 'add' ? 'add_credits' : 'deduct_credits';
    try {
      const res = await axiosClient.post(`/admin/users/${selectedUser.id}/${endpoint}`, { amount: Number(amount) });
      toast.success(res.data.message);
      setSelectedUser(null);
      setAmount(0);
      fetchData('users');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi khi xử lý giao dịch');
    }
  };

  const renderStats = () => {
    if (!stats) return null;
    return (
      <div className="admin-stats-grid fade-in">
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6'}}><FiUsers /></div>
          <div className="stat-content">
            <h4>Tổng Users</h4>
            <h2>{stats.total_users}</h2>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}><FiDollarSign /></div>
          <div className="stat-content">
            <h4>Tổng Doanh Thu</h4>
            <h2>{stats.total_revenue_credits} <span>Credits</span></h2>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b'}}><FiActivity /></div>
          <div className="stat-content">
            <h4>Form Đã Chạy</h4>
            <h2>{stats.total_forms_submitted}</h2>
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    return (
      <div className="admin-table-container glass-panel fade-in">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Trạng thái</th>
              <th>Số dư</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td><span className={`role-badge ${u.role === 'admin' ? 'admin' : 'user'}`}>{u.role}</span></td>
                <td>
                  <span className={`status-badge ${u.is_banned ? 'banned' : 'active'}`}>
                    {u.is_banned ? 'Đã khóa' : 'Hoạt động'}
                  </span>
                </td>
                <td className="wallet-cell"><FiDollarSign size={12}/> {u.wallet_balance}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-action add" onClick={() => { setSelectedUser(u); setActionType('add'); }} title="Cộng tiền">
                      <FiPlus />
                    </button>
                    <button className="btn-action deduct" onClick={() => { setSelectedUser(u); setActionType('deduct'); }} title="Trừ tiền">
                      <FiMinus />
                    </button>
                    {u.role !== 'admin' && (
                      <button className={`btn-action ${u.is_banned ? 'unban' : 'ban'}`} onClick={() => handleToggleBan(u.id)} title={u.is_banned ? "Mở khóa" : "Khóa tài khoản"}>
                        {u.is_banned ? <FiUnlock /> : <FiLock />}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTransactions = () => {
    return (
      <div className="admin-table-container glass-panel fade-in">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>User ID</th>
              <th>Loại GD</th>
              <th>Số tiền</th>
              <th>Mô tả</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td>{new Date(tx.created_at).toLocaleString('vi-VN')}</td>
                <td style={{fontSize: '0.8rem', color: '#9ca3af'}}>{tx.user_id}</td>
                <td><span className={`tx-type-badge ${tx.amount > 0 ? 'deposit' : 'spend'}`}>{tx.type}</span></td>
                <td className={tx.amount > 0 ? 'text-success' : 'text-danger'}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </td>
                <td>{tx.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-title">
          <FiShield className="admin-icon" />
          <div>
            <h1>Admin Panel</h1>
            <p>Quyền lực tối cao quản trị hệ thống</p>
          </div>
        </div>
      </header>

      <div className="admin-tabs">
        <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>
          <FiActivity /> Thống kê
        </button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
          <FiUsers /> Quản lý Users
        </button>
        <button className={activeTab === 'transactions' ? 'active' : ''} onClick={() => setActiveTab('transactions')}>
          <FiDollarSign /> Dòng tiền hệ thống
        </button>
      </div>

      <div className="admin-content">
        {loading ? (
          <div className="loading-state">Đang tải dữ liệu...</div>
        ) : (
          <>
            {activeTab === 'stats' && renderStats()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'transactions' && renderTransactions()}
          </>
        )}
      </div>

      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel fade-in">
            <h3>{actionType === 'add' ? 'Bơm tiền (Cộng Credits)' : 'Phạt tiền (Trừ Credits)'}</h3>
            <p>Người dùng: <b>{selectedUser.email}</b></p>
            <p>Số dư hiện tại: {selectedUser.wallet_balance}</p>
            
            <form onSubmit={handleActionSubmit} className="admin-modal-form">
              <input 
                type="number" 
                min="1" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="Nhập số tiền..."
                required 
              />
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setSelectedUser(null)}>Hủy</button>
                <button type="submit" className={`btn-submit ${actionType === 'add' ? 'btn-success' : 'btn-danger'}`}>
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
