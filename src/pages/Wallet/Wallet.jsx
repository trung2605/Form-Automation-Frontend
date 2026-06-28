import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../../services/axiosClient';
import { AuthContext } from '../../contexts/AuthContext';
import { FiDollarSign, FiPlusCircle, FiList, FiClock, FiCreditCard, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Wallet.css';

const Wallet = () => {
  const { user, refreshWallet } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState(100);
  const [isDepositing, setIsDepositing] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    const cancel = searchParams.get('cancel');

    if (status === 'success' || status === 'PAID') {
      toast.success('Thanh toán thành công! Số dư đã được cập nhật.');
      refreshWallet();
      setSearchParams({});
    } else if (status === 'cancelled' || cancel === 'true') {
      toast.warning('Bạn đã hủy thanh toán.');
      setSearchParams({});
    }

    fetchTransactions();
  }, [searchParams, setSearchParams, refreshWallet]);

  const fetchTransactions = async () => {
    try {
      const response = await axiosClient.get('/payment/transactions');
      setTransactions(response.data);
    } catch (error) {
      toast.error('Lỗi khi tải lịch sử giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const handlePackageDeposit = async (packageId) => {
    setIsDepositing(true);
    try {
      const response = await axiosClient.post('/payment/create-payment-link', { package_id: packageId });
      const { checkoutUrl } = response.data;
      if (checkoutUrl) window.location.href = checkoutUrl;
      else toast.error('Không lấy được link thanh toán từ PayOS');
    } catch (error) {
      toast.error('Lỗi khi tạo mã thanh toán: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsDepositing(false);
    }
  };

  const handleCustomDeposit = async (e) => {
    e.preventDefault();
    if (depositAmount < 20) {
      toast.error('Số lượng tối thiểu là 20 Credits (2.000 VNĐ)');
      return;
    }
    setIsDepositing(true);
    try {
      const response = await axiosClient.post('/payment/create-payment-link', { credits: Number(depositAmount) });
      const { checkoutUrl } = response.data;
      if (checkoutUrl) window.location.href = checkoutUrl;
      else toast.error('Không lấy được link thanh toán từ PayOS');
    } catch (error) {
      toast.error('Lỗi: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsDepositing(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="wallet-container fade-in">
      <div className="wallet-header">
        <h1>Quản Lý Ví (Credits)</h1>
        <p>Chọn một gói nạp để tối ưu chi phí sử dụng</p>
      </div>

      <div className="pricing-grid">
        {/* Starter */}
        <div className="pricing-card glass-panel">
          <h3>Starter</h3>
          <div className="pricing-price">50.000đ</div>
          <div className="pricing-credits">500 Credits</div>
          <ul className="pricing-features">
            <li><FiCheck /> Giá 100đ / Credit</li>
            <li><FiCheck /> Tốc độ tiêu chuẩn</li>
            <li><FiCheck /> AI Cơ bản</li>
          </ul>
          <button
            className="btn-outline w-full"
            onClick={() => handlePackageDeposit('starter')}
            disabled={isDepositing}
          >Mua gói này</button>
        </div>

        {/* Pro */}
        <div className="pricing-card glass-panel pro-card">
          <div className="pricing-badge">KHUYÊN DÙNG</div>
          <h3>Pro</h3>
          <div className="pricing-price">200.000đ</div>
          <div className="pricing-credits">2.500 Credits</div>
          <ul className="pricing-features">
            <li><FiCheck /> Giá 80đ / Credit (Giảm 20%)</li>
            <li><FiCheck /> Tốc độ ưu tiên</li>
            <li><FiCheck /> AI Premium</li>
          </ul>
          <button
            className="btn-ink w-full"
            onClick={() => handlePackageDeposit('pro')}
            disabled={isDepositing}
          >Mua gói này</button>
        </div>

        {/* Enterprise */}
        <div className="pricing-card glass-panel">
          <h3>Enterprise</h3>
          <div className="pricing-price">500.000đ</div>
          <div className="pricing-credits">7.500 Credits</div>
          <ul className="pricing-features">
            <li><FiCheck /> Giá 66đ / Credit (Giảm 33%)</li>
            <li><FiCheck /> Ưu tiên luồng cực cao</li>
            <li><FiCheck /> Hỗ trợ 1-1</li>
          </ul>
          <button
            className="btn-outline w-full"
            onClick={() => handlePackageDeposit('enterprise')}
            disabled={isDepositing}
          >Mua gói này</button>
        </div>
      </div>

      <div className="wallet-grid">
        <div className="wallet-card glass-panel balance-card">
          <div className="balance-info">
            <FiDollarSign className="balance-icon" />
            <div>
              <h3>Số dư hiện tại</h3>
              <div className="balance-amount">{user?.wallet_balance || 0} <span>Credits</span></div>
            </div>
          </div>

          <form className="deposit-form" onSubmit={handleCustomDeposit}>
            <h4>Hoặc nạp số lượng tùy chọn</h4>
            <div className="deposit-input-group">
              <input
                type="number"
                min="20"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary" disabled={isDepositing} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiCreditCard /> Thanh toán
              </button>
            </div>
            <div style={{ marginTop: '12px', fontSize: '14px', color: 'var(--slate-gray)' }}>
              Thành tiền: <b style={{ color: 'var(--ink-black)' }}>{formatCurrency(depositAmount * 100)}</b> (100đ/cr)
            </div>
          </form>
        </div>

        <div className="wallet-card glass-panel history-card">
          <div className="card-header">
            <h3><FiList /> Lịch sử giao dịch</h3>
          </div>

          <div className="transactions-list">
            {loading ? (
              <div className="loading-state">Đang tải lịch sử...</div>
            ) : transactions.length === 0 ? (
              <div className="empty-state">Chưa có giao dịch nào</div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Loại</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                    <th>Mô tả</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>
                        <div className="tx-time">
                          <FiClock size={12} />
                          {new Date(tx.created_at).toLocaleString('vi-VN')}
                        </div>
                      </td>
                      <td>
                        <span className={`tx-type ${tx.amount > 0 ? 'type-deposit' : 'type-spend'}`}>
                          {tx.amount > 0 ? 'Nạp tiền' : 'Sử dụng'}
                        </span>
                      </td>
                      <td className={tx.amount > 0 ? 'text-success' : 'text-danger'}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </td>
                      <td>
                        <span className={`badge ${tx.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>
                          {tx.status === 'pending' ? 'Chờ thanh toán' : 'Thành công'}
                        </span>
                      </td>
                      <td>{tx.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
