import React from 'react';
import { Link } from 'react-router-dom';
import { FiActivity } from 'react-icons/fi';
import Aurora from '../../components/Aurora/Aurora';
import SpotlightCard from '../../components/SpotlightCard/SpotlightCard';

export default function Dashboard() {
  return (
    <div style={{ position: 'relative', minHeight: '100%', padding: '2rem' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, opacity: 0.5 }}>
        <Aurora colorStops={["#FCFBFA", "#F3F0EE", "#e2ded9"]} amplitude={0.5} blend={0.6} speed={0.5} />
      </div>
      
      <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: '2rem', marginBottom: '2rem', color: 'var(--ink)' }}>
        Dashboard
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <Link to="/tool/form-automation" style={{ textDecoration: 'none' }}>
          <SpotlightCard className="dashboard-card" spotlightColor="rgba(243, 115, 56, 0.2)">
            <div style={{ padding: '2rem', color: 'var(--ink)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <FiActivity size={32} color="var(--signal)" />
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Form Automation</h2>
              <p style={{ margin: 0, color: 'var(--slate)' }}>
                Công cụ tự động phân tích và điền Google Form số lượng lớn. Hỗ trợ rẽ nhánh động và bypass captchas.
              </p>
            </div>
          </SpotlightCard>
        </Link>
        
        {/* Placeholder for future tools */}
        <SpotlightCard className="dashboard-card" spotlightColor="rgba(20, 20, 19, 0.1)">
          <div style={{ padding: '2rem', color: 'var(--slate)', display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.6 }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Coming Soon</h2>
            <p style={{ margin: 0 }}>Thêm các công cụ tự động hóa khác trong tương lai...</p>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
