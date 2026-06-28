import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/tool/form-automation');
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container animate-slide-up">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <h2>Chào mừng trở lại</h2>
          <p>Đăng nhập để tiếp tục sử dụng ToolManager</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button type="submit" className="auth-button btn-ink" disabled={isLoading}>
            {isLoading ? 'Đang đăng nhập...' : (
              <>
                <LogIn size={18} style={{marginRight: '8px'}} /> Đăng nhập
              </>
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Chưa có tài khoản? <Link to="/register" className="auth-link">Đăng ký ngay <ArrowRight size={14} /></Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
