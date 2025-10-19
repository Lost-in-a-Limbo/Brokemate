import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Wallet, PlusCircle, LayoutList, BrainCircuit, MessageSquare, LogOut, ArrowUpDown, Trash2, Edit, ThumbsUp, ThumbsDown, Search, X, Send, Home } from 'lucide-react';

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
  const { body, token, ...customOptions } = options;
  const headers = { 'Content-Type': 'application/json', ...customOptions.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { ...customOptions, headers };
  if (body) config.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `HTTP error! Status: ${response.status}` }));
      throw new Error(errorData.detail);
    }
    if (response.status === 204 || response.headers.get('content-length') === '0') return null;
    return response.json();
  } catch (error) {
    console.error(`API Fetch Error (${endpoint}):`, error);
    if (error instanceof TypeError) throw new Error('Could not connect to the server. Please ensure the backend is running.');
    throw error;
  }
};

// --- UI Components with Brokemate Color Scheme ---
const Header = ({ onLogout, onGoHome }) => (
  <header style={{
    background: 'var(--primary-navy)',
    color: 'var(--neutral-white)',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 20
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
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      background: isActive ? 'var(--secondary-green)' : 'var(--neutral-gray-700)',
      color: isActive ? 'white' : 'var(--neutral-gray-300)',
      boxShadow: isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
    }}
    onMouseOver={(e) => {
      if (!isActive) {
        e.target.style.background = 'var(--neutral-gray-600)';
      }
    }}
    onMouseOut={(e) => {
      if (!isActive) {
        e.target.style.background = 'var(--neutral-gray-700)';
      }
    }}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

const Card = ({ children, className = '', style = {} }) => (
  <div style={{
    background: 'var(--neutral-white)',
    padding: '1.5rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid var(--neutral-gray-200)',
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

const ErrorDisplay = ({ message, onClear }) => !message ? null : (
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
    <span>{message}</span>
    <span 
      style={{ position: 'absolute', top: '0.75rem', right: '1rem', cursor: 'pointer' }}
      onClick={onClear}
    >
      <X size={18} />
    </span>
  </div>
);

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

// Export the main components
export { Overview, Header, TabButton, Card, LoadingSpinner, ErrorDisplay, Modal, formatINR, apiFetch, CATEGORIES };
export default ExpenseManager;