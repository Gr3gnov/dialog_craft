import React from 'react';
import MainLayout from './layouts/MainLayout';
import { EditorProvider } from './contexts/EditorContext';
import Workspace from './components/Workspace';

const App: React.FC = () => {
  return (
    <EditorProvider>
      <MainLayout>
        <Workspace />
      </MainLayout>
    </EditorProvider>
  );
};

export default App;
