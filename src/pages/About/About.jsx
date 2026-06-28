import React from 'react';
import './About.css';
import { FiArrowRight } from "react-icons/fi";

export default function About() {
  return (
    <div className="news-page animate-slide-up">
      <div className="news-header animate-slide-up">
        <h1>News and trends</h1>
        <p>Insights, updates, and deep dives into Form Automation and the future of data entry.</p>
      </div>

      {/* Hero Featured Article */}
      <article className="featured-article animate-slide-up delay-100">
        <div className="featured-image-container">
          {/* Using a rich solid color block as placeholder, or a gradient matching Mastercard styling */}
          <div className="featured-image" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}></div>
        </div>
        <div className="featured-content">
          <div className="eyebrow">
            <span className="eyebrow-dot">•</span>
            FEATURED UPDATE
          </div>
          <h2>Introducing Form Routing Engine</h2>
          <p>
            Bạn mệt mỏi với việc điền Google Form thủ công? FORM AUTOMATION là giải pháp web mạnh mẽ giúp bạn tự động hóa hoàn toàn quy trình này. Hệ thống tự động nhận diện các nhánh (rẽ trang), giúp tự động hóa dễ dàng và vượt qua mọi rào cản.
          </p>
          <div>
            <button className="btn-ink">Read the story</button>
          </div>
        </div>
      </article>

      {/* Article Grid */}
      <section className="news-grid-section animate-slide-up delay-200">
        <h2 className="section-title">Latest insights</h2>
        
        <div className="article-grid">
          {/* Article 1 */}
          <article className="article-card">
            <div className="article-image-wrapper">
              <div className="article-image" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}></div>
            </div>
            <div className="eyebrow">
              <span className="eyebrow-dot" style={{ color: 'var(--link-blue)' }}>•</span>
              TECHNOLOGY
            </div>
            <h3>Sức mạnh của trí tuệ nhân tạo trong phân tích Form</h3>
            <p>
              Chỉ cần dán mã nguồn HTML, công cụ của chúng tôi sẽ sử dụng AI để nhận diện toàn bộ cấu trúc form. Điều này giúp loại bỏ hoàn toàn các lỗi nhập liệu thủ công.
            </p>
          </article>

          {/* Article 2 */}
          <article className="article-card">
            <div className="article-image-wrapper">
              <div className="article-image" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}></div>
            </div>
            <div className="eyebrow">
              <span className="eyebrow-dot" style={{ color: '#f59e0b' }}>•</span>
              PRODUCTIVITY
            </div>
            <h3>Gửi hàng loạt với tùy biến linh hoạt</h3>
            <p>
              Dễ dàng điều chỉnh từng trường dữ liệu, từ việc nhập email tuần tự cho đến chọn ngẫu nhiên các câu trả lời theo tỷ lệ (weight) mong muốn.
            </p>
          </article>

          {/* Article 3 */}
          <article className="article-card">
            <div className="article-image-wrapper">
              <div className="article-image" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' }}></div>
            </div>
            <div className="eyebrow">
              <span className="eyebrow-dot" style={{ color: '#ef4444' }}>•</span>
              BEST PRACTICES
            </div>
            <h3>Hướng dẫn sử dụng nhanh Form Automation</h3>
            <p>
              Các bước đơn giản để lấy mã nguồn (Ctrl+U), phân tích cấu trúc, cấu hình email và bắt đầu tự động hóa hàng ngàn bản ghi dữ liệu an toàn.
            </p>
          </article>
        </div>
      </section>

      {/* Developer Info Panel */}
      <section className="developer-panel animate-slide-up delay-400">
        <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>
          <span className="eyebrow-dot" style={{ color: 'var(--canvas-cream)' }}>•</span>
          BEHIND THE SCENES
        </div>
        <h2>Đội ngũ Phát triển</h2>
        <p>
          Được phát triển bởi <b>Lê Trí Trung</b>, sử dụng ReactJS ở frontend, Python (Flask) ở backend và API Gemini của Google để nhận diện dữ liệu thông minh. Mọi đóng góp hoặc báo lỗi đều được chào đón trên GitHub!
        </p>
        <button className="btn-outline" style={{ marginTop: '16px' }}>View on GitHub <FiArrowRight /></button>
      </section>

    </div>
  );
}
