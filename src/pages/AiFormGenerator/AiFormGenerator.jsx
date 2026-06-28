import React, { useState, useEffect, useRef } from 'react';
import './AiFormGenerator.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../services/axiosClient';
import { AuthContext } from '../../contexts/AuthContext';
import { FiSend, FiLoader, FiCopy, FiCheckCircle } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';

function AiFormGenerator() {
  const { user, refreshWallet } = React.useContext(AuthContext);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Chào bạn! Mình là AI Form Generator. Bạn muốn tạo một biểu mẫu Google Form về chủ đề gì? Hãy mô tả chi tiết nhé (bao gồm cả các câu hỏi muốn hỏi, và điều kiện rẽ nhánh nếu có). Phí tạo mỗi form là 5 Credits.' }
  ]);
  const [input, setInput] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!email.trim() || !email.includes('@')) {
      toast.warn("Vui lòng nhập Email hợp lệ để nhận quyền sở hữu Form!");
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await axiosClient.post('/ai-tools/generate-form', {
        prompt: userMessage,
        email: email.trim()
      });

      const { formUrl, formTitle, message } = response.data;
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: message || "Tuyệt vời! Form của bạn đã được tạo thành công.",
        result: {
          url: formUrl,
          title: formTitle || "Untitled Form"
        }
      }]);
      toast.success("Tạo Form thành công!");
      refreshWallet();
    } catch (error) {
      if (error.response?.status === 402) {
        toast.error("Số dư ví không đủ. Vui lòng nạp thêm Credits!");
        setMessages(prev => [...prev, { role: 'assistant', content: "Xin lỗi, số dư của bạn không đủ để tạo form (cần 5 credits)." }]);
      } else {
        toast.error("Lỗi: " + (error.response?.data?.error || error.message));
        setMessages(prev => [...prev, { role: 'assistant', content: "Đã có lỗi xảy ra trong quá trình tạo form. Vui lòng thử lại sau." }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã copy link!");
  };

  return (
    <div className="ai-form-page animate-slide-up">
      <ToastContainer position="bottom-right" theme="colored" />
      
      <header className="page-header">
        <h1>AI FORM GENERATOR</h1>
        <p>Tạo Google Form tự động bằng Trí tuệ nhân tạo</p>
      </header>

      <main className="ai-content">
        <div className="chat-container glass-panel">
          
          <div className="email-config-bar">
            <label htmlFor="ownerEmail">Email nhận quyền Editor Form:</label>
            <input 
              id="ownerEmail"
              type="email" 
              placeholder="VD: tranvan.a@gmail.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-mc"
              required
            />
          </div>

          <div className="chat-history">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <div className="chat-bubble">
                  <div className="chat-text">{msg.content}</div>
                  
                  {msg.result && (
                    <div className="result-card">
                      <div className="result-header">
                        <FiCheckCircle color="#27c93f" size={20} />
                        <h3>{msg.result.title}</h3>
                      </div>
                      <div className="result-body">
                        <div className="qr-wrapper">
                          <QRCodeSVG value={msg.result.url} size={100} />
                        </div>
                        <div className="link-wrapper">
                          <a href={msg.result.url} target="_blank" rel="noreferrer" className="form-link">
                            {msg.result.url}
                          </a>
                          <button className="btn-copy" onClick={() => copyToClipboard(msg.result.url)}>
                            <FiCopy /> Copy Link
                          </button>
                        </div>
                      </div>
                      <div className="result-footer">
                        Form đã được chia sẻ quyền Editor cho email: <b>{email}</b>. Vui lòng kiểm tra email hoặc Google Drive.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message assistant">
                <div className="chat-bubble loading-bubble">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <textarea
              className="chat-input input-mc"
              placeholder="Nhập yêu cầu tạo Form của bạn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              disabled={loading}
              rows={2}
            />
            <button type="submit" className="btn-ink btn-send" disabled={loading || !input.trim()}>
              {loading ? <FiLoader className="spin" /> : <FiSend />}
            </button>
          </form>

        </div>
      </main>
    </div>
  );
}

export default AiFormGenerator;
