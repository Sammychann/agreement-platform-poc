import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error:", error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '40px auto', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#e53e3e' }}>Something went wrong while rendering this page.</h2>
          <pre style={{ background: '#f7fafc', padding: '16px', borderRadius: '4px', overflowX: 'auto', color: '#c53030' }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          {this.state.info && (
            <pre style={{ background: '#edf2f7', padding: '16px', borderRadius: '4px', overflowX: 'auto', fontSize: '12px' }}>
              {this.state.info.componentStack}
            </pre>
          )}
          <button 
            onClick={() => window.location.href = '/'}
            style={{ marginTop: '16px', padding: '8px 16px', background: '#00857C', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Return to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
