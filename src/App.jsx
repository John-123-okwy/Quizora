import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ExamSessionProvider } from './contexts/ExamSessionContext';
import AppRoutes from './routes/AppRoutes';
import OfflineBanner from './components/common/OfflineBanner';
import ErrorBoundary from './components/common/ErrorBoundary';
import UpdateBanner from './components/common/UpdateBanner';
import './styles/global.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ExamSessionProvider>
            <BrowserRouter>
              <OfflineBanner />
              <AppRoutes />
              <UpdateBanner />
            </BrowserRouter>
          </ExamSessionProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;