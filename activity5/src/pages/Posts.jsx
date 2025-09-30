import React, { useContext, useEffect, useMemo, useState } from 'react';
import api from '../api';
import { AuthContext } from '../AuthContext';

export default function Posts() {
  const { token } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState({});

  const load = async () => {
    try {
      const res = await api.get('/posts');
      const list = (res && res.items) ? res.items : (Array.isArray(res) ? res : []);
      setItems(list);
    } catch (e) {
      console.error(e);
      setMessage(e?.response?.data?.message || 'Failed to load posts');
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      const username = localStorage.getItem('username') || '';
      await api.post('/posts', { title, content, authorUsername: username });
      setTitle('');
      setContent('');
      setMessage('Post created');
      await load();
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Failed to create');
    }
  };

  const canCreate = useMemo(() => Boolean(token), [token]);

  return (
    <div className="posts-grid">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Posts</h2>
        {message && <div style={{ color:'#b00', marginBottom:12 }}>{message}</div>}
        <div className="posts-list">
          {items.map((p) => {
            const date = new Date(p.createdAt || Date.now()).toLocaleString();
            const author = p.authorUsername || 'Anonymous';
            const showAll = expanded[p.id];
            const body = showAll ? p.content : (p.content || '').slice(0, 140) + ((p.content && p.content.length > 140) ? '…' : '');
            return (
              <div key={p.id} className="post">
                <h4>{p.title}</h4>
                <div className="muted">{author} • {date}</div>
                <div style={{ marginTop: 6 }}>{body}</div>
                {p.content && p.content.length > 140 && (
                  <button type="button" className="secondary" style={{ marginTop: 8 }} onClick={() => setExpanded((s) => ({ ...s, [p.id]: !s[p.id] }))}>
                    {showAll ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            );
          })}
          {items.length === 0 && <div className="muted">No posts yet.</div>}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Create Post {canCreate ? '' : '(login required)'}</h3>
        <form onSubmit={create}>
          <input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} disabled={!canCreate} />
          <textarea placeholder="Content" value={content} onChange={(e)=>setContent(e.target.value)} disabled={!canCreate} />
          <button type="submit" disabled={!canCreate}>Create</button>
          {!canCreate && <div className="muted" style={{ marginTop:8 }}>Login to create or comment.</div>}
          <div className="muted" style={{ marginTop:8 }}>{message}</div>
        </form>
      </div>
    </div>
  );
}
