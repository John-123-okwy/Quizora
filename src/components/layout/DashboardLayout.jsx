import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BackToTopButton from '../common/BackToTopButton';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className={styles.content}>{children}</main>
      <BackToTopButton />
    </div>
  );
}