import os

home_path = 'src/pages/Home/Home.jsx'
with open(home_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('./Dashboard.css', './Home.css')
content = content.replace('function Dashboard(', 'function Home(')
content = content.replace('export default Dashboard;', 'export default Home;')
content = content.replace('className="mc-dashboard"', 'className="mc-home"')

# Add stats and features section before closing div
addition = '''

      {/* Stats Section */}
      <div className="mc-stats-section animate-slide-up delay-400">
        <div className="stat-card">
          <h2>1M+</h2>
          <p>Forms processed automatically</p>
        </div>
        <div className="stat-card">
          <h2>99.9%</h2>
          <p>Uptime and reliability</p>
        </div>
        <div className="stat-card">
          <h2>500+</h2>
          <p>Hours saved per month</p>
        </div>
      </div>

      {/* Features Section */}
      <div className="mc-features-section animate-slide-up delay-500">
        <h2 className="section-title">T?i sao ch?n chúng tôi?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="eyebrow"><span className="eyebrow-dot">•</span>AUTOMATION</div>
            <h3>T? d?ng hóa hoàn toàn</h3>
            <p>H? th?ng t? d?ng phân tích và x? lý form thông minh không c?n s? can thi?p th? công.</p>
          </div>
          <div className="feature-card">
            <div className="eyebrow"><span className="eyebrow-dot" style={{color: 'var(--link-blue)'}}>•</span>SECURITY</div>
            <h3>B?o m?t t?i da</h3>
            <p>D? li?u c?a b?n du?c mã hóa an toàn, không luu tr? thông tin cá nhân trên máy ch?.</p>
          </div>
          <div className="feature-card">
            <div className="eyebrow"><span className="eyebrow-dot" style={{color: '#f59e0b'}}>•</span>FLEXIBILITY</div>
            <h3>Tùy bi?n linh ho?t</h3>
            <p>H? tr? da d?ng các lo?i câu h?i, t? tr?c nghi?m d?n van b?n, checkbox v?i t? l? ng?u nhiên.</p>
          </div>
        </div>
      </div>
'''
content = content.replace('    </div>\n  );\n}', addition + '    </div>\n  );\n}')

with open(home_path, 'w', encoding='utf-8') as f:
    f.write(content)
