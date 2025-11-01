import React, { useContext, useEffect, useMemo, useState, useRef } from 'react';
import './App.css';
import Posts from './pages/Posts';
import { AuthContext, AuthProvider } from './AuthContext';
import api from './api';
import ProfileModal from './components/ProfileModal';

function Hero() {
  const { username } = useContext(AuthContext);
  const displayText = username ? `${username} YOUR STORY MATTERS` : 'YOUR STORY MATTERS';
  
  return (
    <div className="hero" style={{ backgroundImage: 'url(/headerimg.jpg)' }}>
      <div>
        <div className="muted">{displayText}</div>
        <h1>Connect, Share, Inspire</h1>
      </div>
    </div>
  );
}

function AuthButton({ onOpen, onOpenMyPosts, onOpenProfile }) {
  const { token, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  if (token) {
    return (
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button 
          className="auth-btn my-posts-btn" 
          onClick={onOpenMyPosts}
        >
          My Posts
        </button>
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button 
            className="auth-btn" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            Account
            <span style={{ fontSize: '0.75rem' }}>▼</span>
          </button>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  onOpenProfile();
                  setDropdownOpen(false);
                }}
              >
                View Profile
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  logout();
                  setDropdownOpen(false);
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
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

function MyPostsModal({ onClose }) {
  const { token, username } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (token && username) {
      loadMyPosts();
    }
  }, [token, username]);

  const loadMyPosts = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await api.get('/posts');
      const allPosts = (res && res.items) ? res.items : (Array.isArray(res) ? res : []);
      // Filter posts by current username
      const myPosts = allPosts.filter(post => post.authorUsername === username);
      setPosts(myPosts);
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const startEdit = (post) => {
    setEditingPost(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
    setSelectedImage(null);
    setImagePreview(post.imageUrl ? `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${post.imageUrl}` : null);
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setEditTitle('');
    setEditContent('');
    setSelectedImage(null);
    setImagePreview(null);
  };

  const updatePost = async (postId) => {
    if (!token) return;
    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('content', editContent);
      formData.append('authorUsername', username);
      if (selectedImage) {
        formData.append('image', selectedImage);
      } else if (imagePreview && imagePreview.startsWith('http')) {
        const existingUrl = imagePreview.replace(process.env.REACT_APP_API_URL || 'http://localhost:4000', '');
        formData.append('imageUrl', existingUrl);
      }
      await api.put(`/posts/${postId}`, formData);
      setMessage('Post updated successfully');
      setEditingPost(null);
      setEditTitle('');
      setEditContent('');
      setSelectedImage(null);
      setImagePreview(null);
      await loadMyPosts();
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Failed to update post');
    }
  };

  const deletePost = async (postId) => {
    if (!token || !window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`, { authorUsername: username });
      setMessage('Post deleted successfully');
      await loadMyPosts();
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Failed to delete post');
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content card" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.02em' }}>My Posts</h2>
          <button className="icon-btn" onClick={onClose} style={{ fontSize: '1.25rem' }}>✕</button>
        </div>

        {message && (
          <div style={{ marginBottom: '1rem', color: message.includes('successfully') ? '#059669' : '#dc2626', fontSize: '0.875rem' }}>
            {message}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>You haven't created any posts yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {posts.map((post) => {
              const isEditing = editingPost === post.id;
              const date = new Date(post.createdAt || Date.now()).toLocaleString();

              return (
                <div key={post.id} style={{ border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '12px', padding: '1.5rem' }}>
                  {isEditing ? (
                    <div>
                      <input
                        placeholder="Title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        style={{ marginBottom: '0.75rem' }}
                      />
                      <textarea
                        placeholder="Content"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        style={{ marginBottom: '0.75rem' }}
                      />
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Image (optional)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          style={{ marginBottom: '0.75rem' }}
                        />
                        {imagePreview && (
                          <div style={{ marginTop: '0.75rem', position: 'relative', display: 'inline-block' }}>
                            <img
                              src={imagePreview}
                              alt="Preview"
                              style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px' }}
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="secondary"
                              style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button onClick={() => updatePost(post.id)}>Save</button>
                        <button className="secondary" onClick={cancelEdit}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 600 }}>{post.title}</h4>
                      <div className="muted" style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{date}</div>
                      {post.imageUrl && (
                        <img
                          src={`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${post.imageUrl}`}
                          alt={post.title}
                          style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '12px', marginBottom: '0.75rem' }}
                        />
                      )}
                      <div style={{ fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>{post.content}</div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="secondary" onClick={() => startEdit(post)}>Edit</button>
                        <button className="secondary" onClick={() => deletePost(post.id)}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
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
      <div className="modal-content card auth-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.02em' }}>{mode === 'login' ? 'Login' : 'Sign up'}</h2>
          <button className="icon-btn" onClick={onClose} style={{ fontSize: '1.25rem' }}>✕</button>
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
        {error && <div style={{ marginTop: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>{error}</div>}
      </div>
    </div>
  );
}

function Shell() {
  const [modal, setModal] = useState(null); // 'login' | 'signup' | null
  const [myPostsModal, setMyPostsModal] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Check if scrolled past the header (100vh)
      const scrollPosition = window.scrollY;
      const headerHeight = window.innerHeight;
      setIsScrolled(scrollPosition > headerHeight - 100);
    };

    window.addEventListener('scroll', handleScroll);
    // Check initial state
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="brand">Blog</div>
        <div className="spacer" />
        <AuthButton 
          onOpen={setModal} 
          onOpenMyPosts={() => setMyPostsModal(true)}
          onOpenProfile={() => setProfileModal(true)}
        />
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

      {myPostsModal && (
        <MyPostsModal onClose={() => setMyPostsModal(false)} />
      )}

      {profileModal && (
        <ProfileModal onClose={() => setProfileModal(false)} />
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
