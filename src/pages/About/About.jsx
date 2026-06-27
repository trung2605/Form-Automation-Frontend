import React from 'react';
import './About.css';
import SpotlightCard from '../../components/SpotlightCard/SpotlightCard';

export default function About() {
  return (
    <div className="about-page">
      <SpotlightCard className="about-card" spotlightColor="rgba(243, 115, 56, 0.1)">
        <h1 className="about-title">Giới Thiệu FORM AUTOMATION</h1>
        
        <p className="about-desc">
          Bạn mệt mỏi với việc điền Google Form thủ công? <b>FORM AUTOMATION</b> là giải pháp web mạnh mẽ giúp bạn tự động hóa hoàn toàn quy trình này. Được thiết kế để đơn giản hóa công việc lặp lại, ứng dụng của chúng tôi giúp bạn điền và gửi hàng loạt Google Form một cách nhanh chóng và chính xác. ✨
        </p>
        
        <hr className="about-divider" />

        <h2 className="about-section-title">Tại Sao Bạn Nên Chọn FORM AUTOMATION?</h2>
        <ul className="about-list">
          <li><b>Tiết Kiệm Thời Gian Vượt Trội:</b> Chuyển từ việc điền từng form một sang tự động gửi hàng loạt chỉ với vài cú nhấp chuột, giải phóng thời gian quý báu của bạn. ⏱️</li>
          <li><b>Độ Chính Xác Cao:</b> Loại bỏ lỗi nhập liệu thủ công. Hệ thống tự động phân tích và điền dữ liệu theo cấu hình bạn đã thiết lập. ✅</li>
          <li><b>Tùy Biến Linh Hoạt:</b> Dễ dàng điều chỉnh từng trường dữ liệu, từ việc nhập email tuần tự cho đến chọn ngẫu nhiên các câu trả lời. ⚙️</li>
        </ul>

        <hr className="about-divider" />

        <h2 className="about-section-title">Tính Năng Nổi Bật</h2>
        <ul className="about-list">
          <li><b>Phân Tích Form Thông Minh:</b> Chỉ cần dán mã nguồn HTML, công cụ của chúng tôi sẽ sử dụng trí tuệ nhân tạo để phân tích và nhận diện toàn bộ cấu trúc form. 🤖</li>
          <li><b>Điền và Gửi Hàng Loạt:</b> Hỗ trợ gửi form tự động với số lượng tùy chỉnh, sử dụng danh sách email và dữ liệu đầu vào đã được cấu hình. 🚀</li>
          <li><b>Cấu Hình Dữ Liệu Chuyên Sâu:</b> Kiểm soát hoàn toàn cách dữ liệu được điền vào từng trường (văn bản, lựa chọn, hộp kiểm), cho phép bạn tùy chỉnh mọi chi tiết. 📊</li>
          <li><b>Giao Diện Trực Quan:</b> Giao diện người dùng được thiết kế tối giản, dễ sử dụng, với hướng dẫn từng bước chi tiết giúp bạn bắt đầu ngay lập tức. 🎨</li>
          <li><b>Nền Tảng Đáng Tin Cậy:</b> Kết hợp sức mạnh của ReactJS ở frontend và Python ở backend để đảm bảo hiệu suất và sự ổn định. 🔗</li>
        </ul>

        <hr className="about-divider" />

        <h2 className="about-section-title">Hướng Dẫn Sử Dụng Nhanh</h2>
        <ol className="about-list">
          <li><b>Sao Chép Mã Nguồn:</b> Mở Google Form, nhấn chuột phải và chọn <b>"Xem nguồn trang" (hoặc Ctrl+U)</b>, sau đó sao chép toàn bộ nội dung. 📋</li>
          <li><b>Dán và Phân Tích:</b> Dán mã nguồn vào ô tương ứng trên ứng dụng và nhấn <b>"Phân tích Form"</b> để hệ thống tự động trích xuất các trường. 🔍</li>
          <li><b>Cấu Hình:</b> Nhập URL View Form, danh sách email và tùy chỉnh cấu hình dữ liệu nếu cần. ✏️</li>
          <li><b>Gửi:</b> Nhấn <b>"Gửi Form"</b> để bắt đầu quá trình tự động. 📩</li>
        </ol>

        <hr className="about-divider" />

        <h2 className="about-section-title">Thông Tin Dự Án</h2>
        <ul className="about-list">
          <li><b>Người Phát Triển:</b> Lê Trí Trung</li>
          <li><b>Công Nghệ:</b> Frontend: ReactJS | Backend: Python (Flask) | API: Gemini (Google)</li>
          <li><b>Đóng Góp:</b> Mọi ý kiến, báo lỗi hoặc pull request đều được chào đón trên GitHub. 🤝</li>
        </ul>
      </SpotlightCard>
    </div>
  );
}
