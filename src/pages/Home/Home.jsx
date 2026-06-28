import React from 'react';
import { useNavigate } from 'react-router-dom';
import SpotlightCard from '../../components/SpotlightCard/SpotlightCard';
import { 
  IconAutomation, IconSecurity, IconFlexibility, IconArrow 
} from '../../components/Icons/CustomIcons';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="mc-home">
      {/* Hero Section */}
      <section className="mc-hero-section">
        <div className="hero-background-pattern"></div>
        <div className="hero-aurora"></div>
        
        <div className="mc-hero-content animate-slide-up">
          <div className="eyebrow fade-in delay-200">
            <span className="eyebrow-dot">•</span> NEXT-GEN TOOL HUB
          </div>
          <h1 className="hero-title">TrungLe Tool Manager</h1>
          <p className="hero-subtext">
            Nền tảng quản lý và tự động hóa toàn diện. Trải nghiệm các công cụ AI, trích xuất dữ liệu, và tối ưu quy trình làm việc của bạn từ một trung tâm duy nhất.
          </p>
          <div className="hero-actions">
            <button className="btn-ink btn-lg" onClick={() => navigate('/dashboard')}>
              Khám phá các công cụ <IconArrow className="icon-sm" style={{ marginLeft: '8px' }} />
            </button>
          </div>
        </div>
      </section>

      {/* Services Section (Light Theme) */}
      <section className="mc-services-section">
        <div className="services-header text-center">
          <h2 className="section-title">Tại sao chọn TrungLe Hub?</h2>
        </div>
        
        <div className="services-grid">
          <SpotlightCard className="service-card" spotlightColor="rgba(207, 69, 0, 0.15)">
            <div className="service-icon-wrapper">
              <IconAutomation className="service-icon" />
            </div>
            <h3>Tự động hóa hoàn toàn</h3>
            <p>Hệ thống tự động phân tích và xử lý luồng công việc thông minh không cần sự can thiệp thủ công.</p>
          </SpotlightCard>
          
          <SpotlightCard className="service-card" spotlightColor="rgba(56, 96, 190, 0.15)">
            <div className="service-icon-wrapper">
              <IconSecurity className="service-icon" />
            </div>
            <h3>Bảo mật tối đa</h3>
            <p>Dữ liệu của bạn được mã hóa an toàn, không lưu trữ thông tin cá nhân trên máy chủ.</p>
          </SpotlightCard>
          
          <SpotlightCard className="service-card" spotlightColor="rgba(16, 185, 129, 0.15)">
            <div className="service-icon-wrapper">
              <IconFlexibility className="service-icon" />
            </div>
            <h3>Đa dạng tính năng</h3>
            <p>Kho công cụ khổng lồ từ AI, Marketing đến Xử lý dữ liệu, liên tục được cập nhật.</p>
          </SpotlightCard>
        </div>
      </section>
      
      {/* Metrics Section */}
      <section className="mc-metrics-section">
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-value">6+</div>
            <div className="metric-label">Premium Tools</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">99.9%</div>
            <div className="metric-label">Uptime</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">100k+</div>
            <div className="metric-label">Tasks Automated</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mc-cta-section">
        <div className="cta-content">
          <h2>Sẵn sàng để tối ưu hoá công việc?</h2>
          <p>Trải nghiệm sức mạnh của hàng loạt công cụ mạnh mẽ hoàn toàn tự động.</p>
          <button className="mc-btn-primary cta-btn" onClick={() => navigate('/dashboard')}>
            Truy cập Hub ngay <IconArrow className="btn-icon" />
          </button>
        </div>
        <div className="cta-bg-glow"></div>
      </section>
      
    </div>
  );
}
