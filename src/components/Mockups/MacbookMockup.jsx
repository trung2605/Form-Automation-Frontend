import React from 'react';
import './MacbookMockup.css';

const MacbookMockup = ({ children }) => {
  return (
    <div className="macbook-wrapper">
      <div className="macbook-mockup">
        {/* The screen and its bezel */}
        <div className="macbook-screen-bezel">
          {/* Hardware Notch with Camera */}
          <div className="macbook-hardware-notch">
            <div className="macbook-camera"></div>
          </div>
          
          {/* The actual display area */}
          <div className="macbook-display">
            {/* Glass reflection overlay */}
            <div className="macbook-reflection"></div>
            
            {/* macOS System Menu Bar */}
            <div className="macbook-system-menubar">
              <div className="menubar-left">
                <span className="apple-logo"></span>
                <span className="menubar-bold">AutoForm</span>
                <span>File</span>
                <span>Edit</span>
                <span>View</span>
                <span>Window</span>
                <span>Help</span>
              </div>
              <div className="menubar-right">
                <span>100%</span>
                <span className="menubar-icon">🔋</span>
                <span className="menubar-icon">Wi-Fi</span>
                <span>Fri 10:45 AM</span>
              </div>
            </div>
            
            {/* macOS Window */}
            <div className="macbook-window">
              <div className="macbook-topbar">
                <div className="macbook-dot dot-red"></div>
                <div className="macbook-dot dot-yellow"></div>
                <div className="macbook-dot dot-green"></div>
              </div>
              <div className="macbook-content">
                {children}
              </div>
            </div>
          </div>
          <div className="macbook-logo">MacBook Pro</div>
        </div>

        {/* The aluminum base */}
        <div className="macbook-base">
          <div className="macbook-base-top"></div>
          <div className="macbook-base-bottom">
            <div className="macbook-thumb-groove"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacbookMockup;
