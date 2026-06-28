import React from 'react';
import './IphoneMockup.css';

const IphoneMockup = ({ children }) => {
  return (
    <div className="iphone-mockup">
      <div className="iphone-screen">
        <div className="iphone-dynamic-island">
          <div className="island-camera"></div>
        </div>
        <div className="iphone-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default IphoneMockup;
