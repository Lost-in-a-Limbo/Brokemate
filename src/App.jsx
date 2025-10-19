import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { PlusCircle, Wallet, LayoutList, BrainCircuit, MessageSquare, Camera } from 'lucide-react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import { 
  Overview, 
  AllExpenses, 
  AIAnalysis, 
  AIChat,
  ReceiptUpload,
  Header, 
  TabButton, 
  Card, 
  LoadingSpinner, 
  ErrorDisplay, 
  Modal, 
  ExpenseForm,
  apiFetch 
} from './components/ExpenseComponents';
import './styles/global.css';

// Add animation keyframes to global styles
const styleElement = document.createElement("style");
styleElement.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleElement);

// Main Expense Manager Component
const ExpenseManager = () => {
  const [token, setToken] = useState(() => localStorage.getItem('brokemate_token'));
  const [expenses, setExpenses] = useState([]);
  const [activeView, setActiveView] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLoginSuccess = (newToken) => { 
    localStorage.setItem('brokemate_token', newToken); 
    setToken(newToken);
  };

  const handleLogout = () => { 
    localStorage.removeItem('brokemate_token'); 
    setToken(null); 
    setExpenses([]);
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const fetchExpenses = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true); setError('');
    try { 
      const data = await apiFetch('/expenses', { token }); 
      setExpenses(data || []); 
    }
    catch (err) {
      console.error('Fetch expenses error:', err);
      const errorMsg = err instanceof Error ? err.message : (typeof err === 'string' ? err : 'Failed to fetch expenses');
      setError(errorMsg); 
      if (errorMsg.includes('Could not validate credentials')) handleLogout(); 
    }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleAddExpense = async (formData) => {
    setLoading(true); setError('');
    try { 
      await apiFetch('/add-expense', { method: 'POST', body: formData, token }); 
      fetchExpenses(); 
      setIsAddModalOpen(false); 
    }
    catch (err) { 
      console.error('Add expense error:', err);
      const errorMsg = err instanceof Error ? err.message : (typeof err === 'string' ? err : 'Failed to add expense');
      setError(errorMsg); 
    }
    finally { setLoading(false); }
  };

  if (!token) return <AuthPage onLoginSuccess={handleLoginSuccess} />;

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Wallet, component: <Overview expenses={expenses} /> },
    { id: 'all', label: 'All Expenses', icon: LayoutList, component: <AllExpenses expenses={expenses} token={token} onAction={fetchExpenses} /> },
    { id: 'receipt', label: 'Receipt Scanner', icon: Camera, component: <ReceiptUpload token={token} onSuccess={fetchExpenses} /> },
    { id: 'analysis', label: 'AI Analysis', icon: BrainCircuit, component: <AIAnalysis token={token} /> },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare, component: <AIChat token={token} /> },
  ];

  const activeComponent = TABS.find(tab => tab.id === activeView)?.component;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--gradient-primary)',
      color: 'var(--neutral-gray-800)', 
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        content: '',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"rgba(255,255,255,0.1)\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>")',
        opacity: 0.1,
        pointerEvents: 'none'
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Header onLogout={handleLogout} onGoHome={handleGoHome} />
        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '1rem',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
            {TABS.map(tab => (
              <TabButton 
                key={tab.id} 
                icon={tab.icon} 
                label={tab.label} 
                isActive={activeView === tab.id} 
                onClick={() => setActiveView(tab.id)} 
              />
            ))}
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'var(--gradient-accent)',
              color: 'white',
              boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
              transform: 'translateY(0)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 15px 35px rgba(245, 158, 11, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 25px rgba(245, 158, 11, 0.3)';
            }}
          >
            <PlusCircle size={18} />
            <span>Add Expense</span>
          </button>
        </div>
        <ErrorDisplay message={error} onClear={() => setError('')} />
        {loading && activeView !== 'all' ? <LoadingSpinner /> : activeComponent}
        </main>
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Expense">
          <ExpenseForm onSubmit={handleAddExpense} onCancel={() => setIsAddModalOpen(false)} loading={loading} />
        </Modal>
      </div>
    </div>
  );
};

// Enhanced App Component with Routing
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/expenses" element={<ExpenseManager />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;