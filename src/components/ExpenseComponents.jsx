import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Wallet, PlusCircle, LayoutList, BrainCircuit, MessageSquare, LogOut, Trash2, Edit, ThumbsUp, ThumbsDown, X, Send, Home } from 'lucide-react';

// --- Configuration ---
const API_BASE_URL = 'http://127.0.0.1:8000';
const CATEGORIES = ["Food", "Transport", "Shopping", "Utilities", "Entertainment", "Health", "Other"];

// --- Helper Functions ---
const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// --- API Helper ---
const apiFetch = async (endpoint, options = {}) => {
  const { body, token, isFormData = false, ...customOptions } = options;
  const headers = { ...customOptions.headers };
  
  console.log('🔍 API Fetch Debug:', { endpoint, hasToken: !!token, isFormData, options });
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData, let browser set it
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const config = { ...customOptions, headers };
  
  if (body) {
    if (isFormData) {
      const formData = new FormData();
      Object.keys(body).forEach(key => {
        formData.append(key, body[key]);
      });
      config.body = formData;
    } else {
      config.body = JSON.stringify(body);
    }
  }

  try {
    console.log('📤 Making request to:', `${API_BASE_URL}${endpoint}`, config);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    console.log('📥 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `HTTP error! Status: ${response.status}` }));
      console.error('❌ API Error Response:', errorData);
      throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
    }
    if (response.status === 204 || response.headers.get('content-length') === '0') return null;
    const data = await response.json();
    console.log('✅ API Success:', data);
    return data;
  } catch (error) {
    console.error(`❌ API Fetch Error (${endpoint}):`, error);
    if (error instanceof TypeError) throw new Error('Could not connect to the server. Please ensure the backend is running.');
    throw error;
  }
};

// --- UI Components ---
const Header = ({ onLogout, onGoHome }) => (
  <header style={{
    background: 'rgba(26, 54, 93, 0.95)',
    backdropFilter: 'blur(10px)',
    color: 'var(--neutral-white)',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 20px rgba(37, 99, 235, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 20,
    transition: 'all 0.3s ease'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Wallet size={32} style={{ color: 'var(--secondary-green)' }} />
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Brokemate</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--neutral-gray-300)', margin: 0 }}>Personal Expense Manager</p>
      </div>
    </div>
    <div style={{ display: 'flex', gap: '1rem' }}>
      <button 
        onClick={onGoHome} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'var(--primary-teal)',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => e.target.style.background = 'var(--primary-blue)'}
        onMouseOut={(e) => e.target.style.background = 'var(--primary-teal)'}
      >
        <Home size={18} />
        <span>Home</span>
      </button>
      <button 
        onClick={onLogout} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => e.target.style.background = '#b91c1c'}
        onMouseOut={(e) => e.target.style.background = '#dc2626'}
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  </header>
);

const TabButton = ({ icon: Icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick} 
    style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '1rem 1.5rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: isActive ? 'var(--gradient-secondary)' : 'rgba(255, 255, 255, 0.8)',
      color: isActive ? 'white' : 'var(--primary-navy)',
      boxShadow: isActive ? '0 10px 25px rgba(16, 185, 129, 0.3)' : '0 4px 10px rgba(0, 0, 0, 0.05)',
      transform: isActive ? 'translateY(-2px)' : 'translateY(0)'
    }}
    onMouseOver={(e) => {
      if (!isActive) {
        e.target.style.background = 'rgba(255, 255, 255, 1)';
        e.target.style.transform = 'translateY(-1px)';
        e.target.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.1)';
      }
    }}
    onMouseOut={(e) => {
      if (!isActive) {
        e.target.style.background = 'rgba(255, 255, 255, 0.8)';
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.05)';
      }
    }}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

const Card = ({ children, className = '', style = {} }) => (
  <div style={{
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '2rem',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    ...style
  }} className={className}>
    {children}
  </div>
);

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '2rem' }}>
    <div style={{
      width: '4rem',
      height: '4rem',
      border: '2px solid var(--neutral-gray-200)',
      borderTop: '2px solid var(--secondary-green)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
  </div>
);

const ErrorDisplay = ({ message, onClear }) => {
  if (!message) return null;
  
  // Ensure message is always a string
  let displayMessage;
  if (typeof message === 'string') {
    displayMessage = message;
  } else if (message instanceof Error) {
    displayMessage = message.message;
  } else if (typeof message === 'object') {
    displayMessage = JSON.stringify(message, null, 2);
  } else {
    displayMessage = String(message);
  }
  
  return (
    <div style={{
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid #ef4444',
      color: '#dc2626',
      padding: '1rem',
      borderRadius: '0.5rem',
      position: 'relative',
      margin: '1rem 0'
    }} role="alert">
      <strong style={{ fontWeight: 'bold' }}>Error: </strong>
      <span style={{ whiteSpace: 'pre-wrap' }}>{displayMessage}</span>
      <span 
        style={{ position: 'absolute', top: '0.75rem', right: '1rem', cursor: 'pointer' }}
        onClick={onClear}
      >
        <X size={18} />
      </span>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => !isOpen ? null : (
  <div 
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 50,
      padding: '1rem'
    }}
    onClick={onClose}
  >
    <div 
      style={{
        background: 'var(--neutral-white)',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '1.5rem',
        width: '100%',
        maxWidth: '32rem',
        border: '1px solid var(--neutral-gray-200)'
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--neutral-gray-800)', margin: 0 }}>{title}</h2>
        <button 
          onClick={onClose} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-gray-600)' }}
        >
          <X size={24} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

// --- Feature Components ---
const Overview = ({ expenses }) => {
  const { byCategory, totalExpenses, totalTransactions, averageExpense } = useMemo(() => {
    const categoryMap = {};
    expenses.forEach(exp => {
      categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
    });
    const total = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const count = expenses.length;
    return {
      byCategory: Object.entries(categoryMap).map(([name, value]) => ({ name, value })),
      totalExpenses: total,
      totalTransactions: count,
      averageExpense: count > 0 ? total / count : 0,
    };
  }, [expenses]);

  const COLORS = [
    'var(--primary-blue)',
    'var(--secondary-green)',
    'var(--accent-gold)',
    'var(--primary-teal)',
    'var(--accent-purple)',
    'var(--accent-orange)',
    'var(--secondary-emerald)'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
        <Card>
          <h3 style={{ color: 'var(--neutral-gray-600)', fontSize: '1.125rem', margin: 0 }}>Total Expenses</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary-green)', margin: '0.5rem 0 0 0' }}>
            {formatINR(totalExpenses)}
          </p>
        </Card>
        <Card>
          <h3 style={{ color: 'var(--neutral-gray-600)', fontSize: '1.125rem', margin: 0 }}>Total Transactions</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-navy)', margin: '0.5rem 0 0 0' }}>
            {totalTransactions}
          </p>
        </Card>
        <Card>
          <h3 style={{ color: 'var(--neutral-gray-600)', fontSize: '1.125rem', margin: 0 }}>Average Expense</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-gold)', margin: '0.5rem 0 0 0' }}>
            {formatINR(averageExpense)}
          </p>
        </Card>
      </div>
      <Card>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--neutral-gray-800)' }}>
          Category Distribution
        </h2>
        {expenses.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={byCategory} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={120} 
                label
              >
                {byCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatINR(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--neutral-gray-500)' }}>
            No expense data to display charts.
          </p>
        )}
      </Card>
    </div>
  );
};

const ExpenseForm = ({ expense, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    amount: expense?.amount || '',
    category: expense?.category || '',
    description: expense?.description || '',
    date: expense?.date || new Date().toISOString().split('T')[0],
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, amount: parseFloat(formData.amount) });
  };

  const inputStyle = {
    width: '100%',
    background: 'white',
    border: '1px solid var(--neutral-gray-300)',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    color: 'var(--neutral-gray-800)',
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  const focusStyle = {
    borderColor: 'var(--secondary-green)',
    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--neutral-gray-700)', marginBottom: '0.5rem' }}>
          Amount (₹)
        </label>
        <input 
          type="number" 
          name="amount" 
          value={formData.amount} 
          onChange={handleChange} 
          style={inputStyle}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: 'var(--neutral-gray-300)', boxShadow: 'none' })}
          required 
          step="0.01" 
        />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--neutral-gray-700)', marginBottom: '0.5rem' }}>
          Category
        </label>
        <select 
          name="category" 
          value={formData.category} 
          onChange={handleChange} 
          style={inputStyle}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: 'var(--neutral-gray-300)', boxShadow: 'none' })}
          required
        >
          <option value="">Select a category</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--neutral-gray-700)', marginBottom: '0.5rem' }}>
          Description
        </label>
        <input 
          type="text" 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          style={inputStyle}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: 'var(--neutral-gray-300)', boxShadow: 'none' })}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--neutral-gray-700)', marginBottom: '0.5rem' }}>
          Date
        </label>
        <input 
          type="date" 
          name="date" 
          value={formData.date} 
          onChange={handleChange} 
          style={inputStyle}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: 'var(--neutral-gray-300)', boxShadow: 'none' })}
          required 
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '0.5rem' }}>
        <button 
          type="button" 
          onClick={onCancel} 
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--neutral-gray-600)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = 'var(--neutral-gray-500)'}
          onMouseOut={(e) => e.target.style.background = 'var(--neutral-gray-600)'}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading} 
          style={{
            padding: '0.5rem 1rem',
            background: loading ? 'var(--neutral-gray-500)' : 'var(--secondary-green)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => {
            if (!loading) e.target.style.background = 'var(--secondary-emerald)';
          }}
          onMouseOut={(e) => {
            if (!loading) e.target.style.background = 'var(--secondary-green)';
          }}
        >
          {loading ? 'Saving...' : 'Save Expense'}
        </button>
      </div>
    </form>
  );
};

const AllExpenses = ({ expenses, token, onAction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEdit = (expense) => { setEditingExpense(expense); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingExpense(null); };

  const handleSaveExpense = async (formData) => {
    setLoading(true); setError('');
    const endpoint = editingExpense ? `/edit-expense/${editingExpense.id}` : '/add-expense';
    const method = editingExpense ? 'PUT' : 'POST';
    try {
      await apiFetch(endpoint, { method, body: formData, token });
      onAction(); handleCloseModal();
    } catch (err) { 
      console.error('Save expense error:', err);
      const errorMsg = err instanceof Error ? err.message : (typeof err === 'string' ? err : 'Failed to save expense');
      setError(errorMsg); 
    }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try { await apiFetch(`/delete-expense/${id}`, { method: 'DELETE', token }); onAction(); }
      catch (err) { 
        const errorMsg = err instanceof Error ? err.message : (typeof err === 'string' ? err : 'Failed to delete expense');
        alert(`Error: ${errorMsg}`);
      }
    }
  };

  const handleFlag = async (id, flag) => {
    try { await apiFetch('/flag-expense', { method: 'POST', body: { id, flag }, token }); onAction(); }
    catch (err) { 
      console.error('Flag expense error:', err);
      const errorMsg = err instanceof Error ? err.message : (typeof err === 'string' ? err : 'Failed to flag expense');
      alert(`Error: ${errorMsg}`); 
    }
  };

  return (
    <Card>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--neutral-gray-800)' }}>
        All Expenses
      </h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--neutral-gray-300)' }}>
              <th style={{ padding: '0.75rem', color: 'var(--neutral-gray-700)', fontWeight: '600' }}>Date</th>
              <th style={{ padding: '0.75rem', color: 'var(--neutral-gray-700)', fontWeight: '600' }}>Amount</th>
              <th style={{ padding: '0.75rem', color: 'var(--neutral-gray-700)', fontWeight: '600' }}>Category</th>
              <th style={{ padding: '0.75rem', color: 'var(--neutral-gray-700)', fontWeight: '600' }}>Description</th>
              <th style={{ padding: '0.75rem', color: 'var(--neutral-gray-700)', fontWeight: '600' }}>Flag</th>
              <th style={{ padding: '0.75rem', color: 'var(--neutral-gray-700)', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(exp => (
              <tr key={exp.id} style={{ borderBottom: '1px solid var(--neutral-gray-200)' }}>
                <td style={{ padding: '0.75rem' }}>
                  {new Date(exp.date).toLocaleDateString('en-IN')}
                </td>
                <td style={{ padding: '0.75rem', fontWeight: '600', color: 'var(--secondary-green)' }}>
                  {formatINR(exp.amount)}
                </td>
                <td style={{ padding: '0.75rem' }}>{exp.category}</td>
                <td style={{ padding: '0.75rem', color: 'var(--neutral-gray-600)' }}>{exp.description}</td>
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {exp.flag === 'green' ? (
                      <ThumbsUp size={20} style={{ color: 'var(--secondary-green)' }} />
                    ) : (
                      <button 
                        onClick={() => handleFlag(exp.id, 'green')} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-gray-500)' }}
                        onMouseOver={(e) => e.target.style.color = 'var(--secondary-green)'}
                        onMouseOut={(e) => e.target.style.color = 'var(--neutral-gray-500)'}
                      >
                        <ThumbsUp size={20} />
                      </button>
                    )}
                    {exp.flag === 'red' ? (
                      <ThumbsDown size={20} style={{ color: '#ef4444' }} />
                    ) : (
                      <button 
                        onClick={() => handleFlag(exp.id, 'red')} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-gray-500)' }}
                        onMouseOver={(e) => e.target.style.color = '#ef4444'}
                        onMouseOut={(e) => e.target.style.color = 'var(--neutral-gray-500)'}
                      >
                        <ThumbsDown size={20} />
                      </button>
                    )}
                  </div>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                      onClick={() => handleEdit(exp)} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-blue)' }}
                      onMouseOver={(e) => e.target.style.color = 'var(--primary-navy)'}
                      onMouseOut={(e) => e.target.style.color = 'var(--primary-blue)'}
                    >
                      <Edit size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(exp.id)} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                      onMouseOver={(e) => e.target.style.color = '#dc2626'}
                      onMouseOut={(e) => e.target.style.color = '#ef4444'}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingExpense ? "Edit Expense" : "Add Expense"}>
        <ErrorDisplay message={error} onClear={() => setError('')} />
        <ExpenseForm expense={editingExpense} onSubmit={handleSaveExpense} onCancel={handleCloseModal} loading={loading} />
      </Modal>
    </Card>
  );
};

const AIAnalysis = ({ token }) => {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setLoading(true); setError(''); setAnalysis('');
    try { const data = await apiFetch('/analyze', { method: 'POST', token }); setAnalysis(data.analysis); }
    catch (err) { 
      console.error('Analyze error:', err);
      const errorMsg = err instanceof Error ? err.message : (typeof err === 'string' ? err : 'Failed to analyze expenses');
      setError(errorMsg); 
    }
    finally { setLoading(false); }
  };

  return (
    <Card style={{ textAlign: 'center' }}>
      <BrainCircuit size={48} style={{ margin: '0 auto 1rem auto', color: 'var(--secondary-green)' }} />
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--neutral-gray-800)' }}>
        AI Expense Analysis
      </h2>
      <p style={{ color: 'var(--neutral-gray-600)', marginBottom: '1.5rem' }}>
        Get personalized insights and tips on your spending habits.
      </p>
      <button 
        onClick={handleAnalyze} 
        disabled={loading} 
        style={{
          background: loading ? 'var(--neutral-gray-500)' : 'var(--secondary-green)',
          color: 'white',
          fontWeight: 'bold',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s'
        }}
        onMouseOver={(e) => {
          if (!loading) e.target.style.background = 'var(--secondary-emerald)';
        }}
        onMouseOut={(e) => {
          if (!loading) e.target.style.background = 'var(--secondary-green)';
        }}
      >
        {loading ? 'Analyzing...' : 'Analyze My Expenses'}
      </button>
      <ErrorDisplay message={error} onClear={() => setError('')} />
      {loading && <LoadingSpinner />}
      {analysis && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'var(--neutral-gray-100)',
          borderRadius: '0.5rem',
          textAlign: 'left',
          whiteSpace: 'pre-wrap',
          color: 'var(--neutral-gray-800)'
        }}>
          {analysis}
        </div>
      )}
    </Card>
  );
};

const AIChat = ({ token }) => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hi! I'm your AI financial assistant. Ask me anything about your expenses." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userQuery = input;
    const newMessages = [...messages, { sender: 'user', text: userQuery }];
    setMessages(newMessages); setInput(''); setLoading(true);

    try {
      const data = await apiFetch('/chat', { method: 'POST', body: { query: userQuery }, token });
      console.log('Chat response data:', data);
      
      // Ensure we're getting a string response
      const aiResponse = typeof data.response === 'string' 
        ? data.response 
        : (typeof data === 'string' ? data : JSON.stringify(data));
      
      setMessages([...newMessages, { sender: 'ai', text: aiResponse }]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = err instanceof Error ? err.message : (typeof err === 'string' ? err : 'An unexpected error occurred');
      setMessages([...newMessages, { sender: 'ai', text: `Sorry, I ran into an error: ${errorMsg}` }]);
    } finally { setLoading(false); }
  };

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--neutral-gray-800)' }}>
        Chat with Brokebot
      </h2>
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg, index) => {
          // Ensure msg.text is always a string
          const messageText = typeof msg.text === 'string' 
            ? msg.text 
            : (typeof msg.text === 'object' ? JSON.stringify(msg.text, null, 2) : String(msg.text));
          
          return (
            <div key={index} style={{ display: 'flex', justifyContent: msg.sender === 'ai' ? 'flex-start' : 'flex-end' }}>
              <div style={{
                maxWidth: '32rem',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                background: msg.sender === 'ai' ? 'var(--neutral-gray-200)' : 'var(--secondary-green)',
                color: msg.sender === 'ai' ? 'var(--neutral-gray-800)' : 'white',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {messageText}
              </div>
            </div>
          );
        })}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--neutral-gray-200)' }}>
              ...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyPress={e => e.key === 'Enter' && handleSend()} 
          style={{
            flex: 1,
            background: 'white',
            border: '1px solid var(--neutral-gray-300)',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            color: 'var(--neutral-gray-800)',
            outline: 'none'
          }}
          placeholder="Ask about your spending..." 
        />
        <button 
          onClick={handleSend} 
          disabled={loading} 
          style={{
            background: loading ? 'var(--neutral-gray-500)' : 'var(--secondary-green)',
            color: 'white',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          <Send size={20} />
        </button>
      </div>
    </Card>
  );
};

const ReceiptUpload = ({ token, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('Receipt items');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a valid image file (JPG, PNG, etc.)');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a receipt image first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);

      const response = await fetch(`${API_BASE_URL}/process-receipt`, {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setSuccess(`Successfully processed receipt! Added ${data.expenses_added} expenses.`);
      setFile(null);
      setDescription('Receipt items');
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      // Call success callback to refresh expenses
      if (onSuccess) onSuccess();

    } catch (err) {
      console.error('Receipt upload error:', err);
      const errorMsg = err instanceof Error ? err.message : (typeof err === 'string' ? err : 'Failed to process receipt');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--neutral-gray-800)' }}>
          📱 Receipt Scanner
        </h2>
        <p style={{ color: 'var(--neutral-gray-600)', marginBottom: '1.5rem' }}>
          Upload a receipt image to automatically extract and categorize expenses
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--neutral-gray-700)', marginBottom: '0.5rem' }}>
            Receipt Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--neutral-gray-300)',
              borderRadius: '0.5rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            placeholder="e.g., Grocery shopping, Restaurant bill"
            onFocus={(e) => e.target.style.borderColor = 'var(--primary-teal)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--neutral-gray-300)'}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--neutral-gray-700)', marginBottom: '0.5rem' }}>
            Receipt Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px dashed var(--neutral-gray-300)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary-teal)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--neutral-gray-300)'}
          />
          {file && (
            <p style={{ fontSize: '0.875rem', color: 'var(--secondary-green)', marginTop: '0.5rem' }}>
              ✓ Selected: {file.name}
            </p>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          style={{
            width: '100%',
            background: loading || !file ? 'var(--neutral-gray-500)' : 'var(--gradient-secondary)',
            color: 'white',
            fontWeight: 'bold',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: loading || !file ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: loading || !file ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.3)'
          }}
          onMouseOver={(e) => {
            if (!loading && file) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading && file) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
            }
          }}
        >
          {loading ? 'Processing Receipt...' : 'Process Receipt'}
        </button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          color: '#dc2626',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginTop: '1rem'
        }}>
          <strong>Error: </strong>{error}
        </div>
      )}

      {success && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid var(--secondary-green)',
          color: 'var(--secondary-emerald)',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginTop: '1rem',
          fontWeight: '500'
        }}>
          ✅ {success}
        </div>
      )}

      <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--neutral-gray-600)' }}>
        <p><strong>📋 Supported formats:</strong> JPG, PNG, WEBP</p>
        <p><strong>🤖 AI-powered:</strong> Automatically categorizes items</p>
      </div>
    </Card>
  );
};

export { Overview, ExpenseForm, AllExpenses, AIAnalysis, AIChat, ReceiptUpload, Header, TabButton, Card, LoadingSpinner, ErrorDisplay, Modal, formatINR, apiFetch, CATEGORIES };