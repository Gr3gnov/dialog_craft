import React, { ReactNode } from 'react';
import styles from './MainLayout.module.css';
import { useEditor } from '../contexts/EditorContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { scene, isModified } = useEditor();
  
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.logo}>Dialog Craft</div>
        <div className={styles.sceneName}>
          {scene.name} {isModified && '*'}
        </div>
        <div className={styles.actions}>
          <button className={styles.actionButton}>Сохранить</button>
          <button className={styles.actionButton}>Открыть</button>
          <button className={styles.actionButton}>Экспорт</button>
        </div>
      </header>
      <main className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <div className={styles.status}>
          Карточек: {scene.cards.length} | Связей: {scene.edges.length}
        </div>
        <div className={styles.logs}>
          <button className={styles.logsButton}>Логи</button>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
