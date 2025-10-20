import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import PatientListPage from './pages/PatientListPage';
import VisitDiffPage from './pages/VisitDiffPage';
import { AppContextProvider } from './contexts/AppContext';

function App() {
  return (
    <AppContextProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/patients" element={<PatientListPage />} />
              <Route path="/patient/:patientId" element={<VisitDiffPage />} />
              <Route path="/" element={<Navigate to="/patients" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppContextProvider>
  );
}

export default App;