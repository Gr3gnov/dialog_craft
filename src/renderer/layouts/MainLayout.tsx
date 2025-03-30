import React, { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      overflow: 'hidden'
    }}>
      <header style={{ 
        padding: '10px 20px', 
        background: '#f5f5f5', 
        borderBottom: '1px solid #ddd'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Dialog Craft</h1>
      </header>
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
