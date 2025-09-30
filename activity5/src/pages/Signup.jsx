import React, { useContext, useState } from 'react';
import { AuthContext } from '../AuthContext';

export default function Signup() {
  const { register } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(email, password);
      setMessage('Registered. You can login now.');
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-card card">
      <h2>Sign up</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button type="submit">Register</button>
      </form>
      <div style={{ marginTop:8 }} className="muted">{message}</div>
    </div>
  );
}
