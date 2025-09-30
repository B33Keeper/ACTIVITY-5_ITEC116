import React, { useContext, useMemo, useState } from 'react';
import './App.css';
import Posts from './pages/Posts';
import { AuthContext, AuthProvider } from './AuthContext';

function Hero() {
  const heroUrl = 'https://images.unsplash.com/photo-1475724017904-b712052c192a?q=80&w=1600&auto=format&fit=crop';
  return (
    <div className="hero" style={{ backgroundImage: `url(${heroUrl})` }}>
      <div>
        <div className="muted" style={{ letterSpacing: 3 }}>A LIFESTYLE BLOG</div>
        <h1>Lovely Little Things</h1>
      </div>
    </div>
  );
}

function AuthButton({ onOpen }) {
  const { token, logout } = useContext(AuthContext);
  if (token) {
    return (
      <button className="auth-btn" onClick={logout}>Logout</button>
    );
  }
  return (
    <button className="auth-btn" onClick={() => onOpen('login')}>Login</button>
  );
}

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        placeholder={placeholder}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="icon-btn"
        aria-label={show ? 'Hide password' : 'Show password'}
        title={show ? 'Hide password' : 'Show password'}
        style={{ position: 'absolute', right: 6, top: 6 }}
        onClick={() => setShow(!show)}
      >
        {show ? '🙈' : '👁'}
      </button>
    </div>
  );
}

function strengthLabel(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return ['Weak', 'Fair', 'Good', 'Strong'][Math.max(0, score - 1)];
}

function AuthModal({ mode, onClose, onSwitch }) {
  const { login, register } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const pwStrength = useMemo(() => strengthLabel(password), [password]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (password !== confirm) {
          setError("Passwords don't match");
          return;
        }
        await register(username, email, password);
      }
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || 'Request failed');
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content card auth-card" style={{ width: 'min(92vw, 480px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>{mode === 'login' ? 'Login' : 'Sign up'}</h2>
          <button className="secondary" onClick={onClose} style={{ padding: '6px 10px' }}>✕</button>
        </div>
        <form onSubmit={submit}>
          {mode === 'signup' && (
            <input placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />
          )}
          <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <PasswordInput placeholder="Password" value={password} onChange={setPassword} />
          {mode === 'signup' && (
            <>
              <PasswordInput placeholder="Confirm password" value={confirm} onChange={setConfirm} />
              <div className="muted">Password strength: {pwStrength}</div>
            </>
          )}
          <button type="submit">{mode === 'login' ? 'Login' : 'Sign Up'}</button>
          {mode === 'login' ? (
            <button type="button" className="secondary" onClick={() => onSwitch('signup')}>Register</button>
          ) : (
            <button type="button" className="secondary" onClick={() => onSwitch('login')}>Already have an account? Login</button>
          )}
        </form>
        {error && <div style={{ marginTop: 8, color: '#b91c1c' }}>{error}</div>}
      </div>
    </div>
  );
}

function Shell() {
  const [modal, setModal] = useState(null); // 'login' | 'signup' | null

  return (
    <div>
      <header className="header">
        <div className="brand">Activity 5</div>
        <div className="spacer" />
        <AuthButton onOpen={setModal} />
      </header>

      <Hero />

      <div className="container">
        <Posts />
      </div>

      {modal && (
        <AuthModal
          mode={modal}
          onClose={() => setModal(null)}
          onSwitch={setModal}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}

export default App;
