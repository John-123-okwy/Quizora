import DashboardLayout from '../components/layout/DashboardLayout';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <DashboardLayout>
      <div style={{ padding: '1.5rem' }}>
        <h1>Settings</h1>
        <div style={{ marginTop: '1rem' }}>
          <label>
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
            {' '}Dark mode
          </label>
        </div>
      </div>
    </DashboardLayout>
  );
}