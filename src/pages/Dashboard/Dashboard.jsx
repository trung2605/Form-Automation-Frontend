import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { IconAutomation, IconDocument, IconDatabase, IconMessage, IconMic, IconTrending, IconSearch, IconClock, IconCheckCircle, IconArrow } from '../../components/Icons/CustomIcons';
import './Dashboard.css';

const mockTools = [
  {
    id: 1,
    title: 'Form Automation',
    description: 'Tự động hóa hoàn toàn quy trình điền và gửi Google Form với trí tuệ nhân tạo và hệ thống định tuyến thông minh.',
    icon: <IconAutomation />,
    category: 'Tự động hóa',
    status: 'active',
    route: '/tool/form-automation'
  },
  {
    id: 2,
    title: 'Intelligent OCR',
    description: 'Trích xuất dữ liệu tự động từ hình ảnh, hóa đơn và tài liệu giấy tờ bằng công nghệ OCR tiên tiến.',
    icon: <IconDocument />,
    category: 'Dữ liệu',
    status: 'upcoming',
    route: '#'
  },
  {
    id: 3,
    title: 'Data Extractor',
    description: 'Tự động quét và thu thập dữ liệu có cấu trúc từ bất kỳ trang web nào chỉ với một đường link.',
    icon: <IconDatabase />,
    category: 'Dữ liệu',
    status: 'upcoming',
    route: '#'
  },
  {
    id: 4,
    title: 'Social Media Bot',
    description: 'Lập lịch và tự động đăng bài viết, tương tác với khách hàng trên đa nền tảng mạng xã hội.',
    icon: <IconMessage />,
    category: 'Tự động hóa',
    status: 'upcoming',
    route: '#'
  },
  {
    id: 5,
    title: 'Voice to Text AI',
    description: 'Chuyển đổi âm thanh cuộc họp, phỏng vấn thành văn bản có độ chính xác cao bằng mô hình Whisper.',
    icon: <IconMic />,
    category: 'AI & Machine Learning',
    status: 'upcoming',
    route: '#'
  },
  {
    id: 6,
    title: 'SEO Keyword Analyzer',
    description: 'Phân tích mật độ từ khóa, tối ưu hóa on-page SEO và theo dõi thứ hạng trên công cụ tìm kiếm.',
    icon: <IconTrending />,
    category: 'Marketing',
    status: 'upcoming',
    route: '#'
  }
];

const categories = ['Tất cả', 'Tự động hóa', 'Dữ liệu', 'AI & Machine Learning', 'Marketing'];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('default');
  const cardsRef = useRef([]);

  const handleMouseMove = (e, index) => {
    const card = cardsRef.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  // Filter tools based on search query and category
  const filteredTools = mockTools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Tất cả' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort tools
  const sortedTools = [...filteredTools].sort((a, b) => {
    if (sortBy === 'a-z') return a.title.localeCompare(b.title);
    if (sortBy === 'z-a') return b.title.localeCompare(a.title);
    if (sortBy === 'newest') return b.id - a.id;
    return 0; // default
  });

  return (
    <div className="tools-directory animate-slide-up">
      <div className="dot-grid-bg"></div>
      <div className="aurora-bg"></div>
      
      <div className="tools-header">
        <h1>Các Công Cụ</h1>
        <p>Khám phá bộ công cụ mạnh mẽ giúp tự động hóa quy trình làm việc và tối ưu hóa thời gian của bạn.</p>
      </div>
      
      {/* Search and Filters Section */}
      <div className="tools-controls">
        <div className="search-bar-wrapper">
          <IconSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm công cụ..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="tools-search-input"
          />
        </div>
        
        <div className="filters-row">
          <div className="categories-filter">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="sort-filter">
            <span className="sort-label">Sắp xếp:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="default">Mặc định</option>
              <option value="a-z">Từ A - Z</option>
              <option value="z-a">Từ Z - A</option>
              <option value="newest">Mới nhất</option>
            </select>
          </div>
        </div>
      </div>

      <div className="tools-grid">
        {sortedTools.length > 0 ? (
          sortedTools.map((tool, idx) => (
            <div key={tool.id} className="tool-card-wrapper">
              {tool.status === 'active' ? (
                <Link 
                  to={tool.route} 
                  className="tool-card"
                  ref={(el) => (cardsRef.current[idx] = el)}
                  onMouseMove={(e) => handleMouseMove(e, idx)}
                >
                  <div className="tool-icon">{tool.icon}</div>
                  <div className="tool-info">
                    <h3>{tool.title}</h3>
                    <p>{tool.description}</p>
                    <div className="tool-category-tag">{tool.category}</div>
                  </div>
                  <div className="tool-footer">
                    <div className="tool-status status-active">
                      <IconCheckCircle /> Đang hoạt động
                    </div>
                    <div className="tool-action">
                      Sử dụng <IconArrow />
                    </div>
                  </div>
                </Link>
              ) : (
                <div 
                  className="tool-card" 
                  style={{ cursor: 'not-allowed', opacity: 0.7 }}
                  ref={(el) => (cardsRef.current[idx] = el)}
                  onMouseMove={(e) => handleMouseMove(e, idx)}
                >
                  <div className="tool-icon">{tool.icon}</div>
                  <div className="tool-info">
                    <h3>{tool.title}</h3>
                    <p>{tool.description}</p>
                    <div className="tool-category-tag">{tool.category}</div>
                  </div>
                  <div className="tool-footer">
                    <div className="tool-status status-upcoming">
                      <IconClock /> Sắp ra mắt
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-tools-found">
            <IconSearch className="no-tools-icon" />
            <h3>Không tìm thấy công cụ</h3>
            <p>Không có công cụ nào phù hợp với từ khóa "{searchQuery}"</p>
            <button className="mc-btn-secondary" onClick={() => { setSearchQuery(''); setActiveCategory('Tất cả'); }}>
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
