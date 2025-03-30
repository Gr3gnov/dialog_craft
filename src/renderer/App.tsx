import React from 'react';
import MainLayout from './layouts/MainLayout';

const App: React.FC = () => {
  return (
    <MainLayout>
      <div style={{ padding: '20px' }}>
        <h1>Dialog Craft</h1>
        <p>Редактор диалоговых систем для геймдизайнеров</p>
      </div>
    </MainLayout>
  );
};

export default App;
