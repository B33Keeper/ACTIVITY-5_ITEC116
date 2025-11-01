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
  const [editingPost, setEditingPost] = useState(null);
  const [comments, setComments] = useState({});
  const [commentContent, setCommentContent] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const username = useMemo(() => localStorage.getItem('username') || '', []);

  const load = async () => {
    try {
      const res = await api.get('/posts');
      const list = (res && res.items) ? res.items : (Array.isArray(res) ? res : []);
      setItems(list);
      // Load comments for all posts
      for (const post of list) {
        await loadComments(post.id);
      }
    } catch (e) {
      console.error(e);
      setMessage(e?.response?.data?.message || 'Failed to load posts');
    }
  };

  const loadComments = async (postId) => {
    try {
      const res = await api.get(`/comments?postId=${postId}`);
      const list = (res && res.items) ? res.items : (Array.isArray(res) ? res : []);
      setComments(prev => ({ ...prev, [postId]: list }));
    } catch (e) {
      console.error('Failed to load comments', e);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('authorUsername', username);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      await api.post('/posts', formData);
      setTitle('');
      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
      setMessage('Post created');
      await load();
    } catch (e) {
      const errorMessage = e?.response?.data?.message || e?.message || 'Failed to create post';
      setMessage(errorMessage);
      
      // If it's a file error, clear the file input
      if (errorMessage.includes('file') || errorMessage.includes('File')) {
        setSelectedImage(null);
        setImagePreview(null);
      }
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
      
      if (!allowedTypes.includes(file.type) || !allowedExtensions.test(file.name)) {
        setMessage('Invalid file type. Accepted formats: JPG, JPEG, PNG, GIF, WEBP');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setMessage('File too large. Maximum size is 5MB.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      setMessage(''); // Clear any previous messages
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
    setTitle(post.title);
    setContent(post.content);
    setSelectedImage(null);
    setImagePreview(post.imageUrl ? `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${post.imageUrl}` : null);
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setTitle('');
    setContent('');
    setSelectedImage(null);
    setImagePreview(null);
  };

  const update = async (postId) => {
    if (!token) return;
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('authorUsername', username);
      if (selectedImage) {
        formData.append('image', selectedImage);
      } else if (imagePreview && imagePreview.startsWith('http')) {
        // Keep existing image if no new image selected
        const existingUrl = imagePreview.replace(process.env.REACT_APP_API_URL || 'http://localhost:4000', '');
        formData.append('imageUrl', existingUrl);
      }
      await api.put(`/posts/${postId}`, formData);
      setEditingPost(null);
      setTitle('');
      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
      setMessage('Post updated');
      await load();
    } catch (e) {
      const errorMessage = e?.response?.data?.message || e?.message || 'Failed to update post';
      setMessage(errorMessage);
      
      // If it's a file error, clear the file input
      if (errorMessage.includes('file') || errorMessage.includes('File')) {
        setSelectedImage(null);
        setImagePreview(null);
      }
    }
  };

  const remove = async (postId) => {
    if (!token || !window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`, { authorUsername: username });
      setMessage('Post deleted');
      await load();
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Failed to delete');
    }
  };

  const createComment = async (postId) => {
    if (!token) return;
    const content = commentContent[postId] || '';
    if (!content.trim()) return;
    try {
      await api.post('/comments', { content, postId, authorUsername: username });
      setCommentContent(prev => ({ ...prev, [postId]: '' }));
      await loadComments(postId);
      setMessage('Comment created');
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Failed to create comment');
    }
  };

  const startEditComment = (comment) => {
    setEditingComment(comment.id);
    setCommentContent(prev => ({ ...prev, [`comment_${comment.id}`]: comment.content }));
  };

  const cancelEditComment = () => {
    setEditingComment(null);
  };

  const updateComment = async (comment) => {
    if (!token) return;
    const content = commentContent[`comment_${comment.id}`] || '';
    if (!content.trim()) return;
    try {
      await api.put(`/comments/${comment.id}`, { content, authorUsername: username });
      setEditingComment(null);
      await loadComments(comment.postId);
      setMessage('Comment updated');
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Failed to update comment');
    }
  };

  const removeComment = async (comment) => {
    if (!token || !window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.delete(`/comments/${comment.id}`, { authorUsername: username });
      await loadComments(comment.postId);
      setMessage('Comment deleted');
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Failed to delete comment');
    }
  };

  const canCreate = useMemo(() => Boolean(token), [token]);
  const isAuthor = (item) => item.authorUsername && item.authorUsername === username;

  return (
    <div className="posts-grid">
      <div className="card">
        <h2>Posts</h2>
        {message && <div style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.875rem' }}>{message}</div>}
        <div className="posts-list">
          {items.map((p) => {
            const date = new Date(p.createdAt || Date.now()).toLocaleString();
            const author = p.authorUsername || 'Anonymous';
            const showAll = expanded[p.id];
            const body = showAll ? p.content : (p.content || '').slice(0, 140) + ((p.content && p.content.length > 140) ? '…' : '');
            const postComments = comments[p.id] || [];
            const isEditing = editingPost === p.id;
            
            return (
              <div key={p.id} className="post">
                {isEditing ? (
                  <div>
                    <input
                      placeholder="Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                      placeholder="Content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => update(p.id)}>Save</button>
                      <button className="secondary" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h4>{p.title}</h4>
                    <div className="muted">{author} • {date}</div>
                    {p.imageUrl && (
                      <img
                        src={`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${p.imageUrl}`}
                        alt={p.title}
                      />
                    )}
                    <div className="post-content">{body}</div>
                    {p.content && p.content.length > 140 && (
                      <button
                        type="button"
                        className="secondary"
                        style={{ marginTop: '0.75rem' }}
                        onClick={() => setExpanded((s) => ({ ...s, [p.id]: !s[p.id] }))}
                      >
                        {showAll ? 'Show less' : 'Read more'}
                      </button>
                    )}
                    {canCreate && isAuthor(p) && (
                      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => startEdit(p)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => remove(p.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Comments Section */}
                <div className="comments-section">
                  <h5 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.01em' }}>Comments ({postComments.length})</h5>
                  
                  {/* Comment List */}
                  <div style={{ marginBottom: '1rem' }}>
                    {postComments.map((comment) => {
                      const commentDate = new Date(comment.createdAt || Date.now()).toLocaleString();
                      const commentAuthor = comment.authorUsername || 'Anonymous';
                      const isEditingComment = editingComment === comment.id;
                      
                      return (
                        <div key={comment.id} className="comment-item">
                          {isEditingComment ? (
                            <div>
                              <textarea
                                value={commentContent[`comment_${comment.id}`] || comment.content}
                                onChange={(e) => setCommentContent(prev => ({ ...prev, [`comment_${comment.id}`]: e.target.value }))}
                                style={{ marginBottom: '0.75rem' }}
                              />
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => updateComment(comment)}>Save</button>
                                <button className="secondary" onClick={cancelEditComment}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div style={{ fontSize: '0.9375rem', marginBottom: '0.5rem', lineHeight: 1.6 }}>{comment.content}</div>
                              <div className="muted" style={{ fontSize: '0.8125rem' }}>{commentAuthor} • {commentDate}</div>
                              {canCreate && isAuthor(comment) && (
                                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    type="button"
                                    className="secondary"
                                    style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
                                    onClick={() => startEditComment(comment)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="secondary"
                                    style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
                                    onClick={() => removeComment(comment)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Create Comment */}
                  {canCreate ? (
                    <div>
                      <textarea
                        placeholder="Write a comment..."
                        value={commentContent[p.id] || ''}
                        onChange={(e) => setCommentContent(prev => ({ ...prev, [p.id]: e.target.value }))}
                        style={{ marginBottom: '0.75rem' }}
                      />
                      <button onClick={() => createComment(p.id)}>Add Comment</button>
                    </div>
                  ) : (
                    <div className="muted" style={{ fontSize: '0.875rem' }}>Login to comment</div>
                  )}
                </div>
              </div>
            );
          })}
          {items.length === 0 && <div className="muted" style={{ textAlign: 'center', padding: '3rem 0' }}>No posts yet. Be the first to share!</div>}
        </div>
      </div>

      <div className="card create-post-card">
        <h3>Create Post {canCreate ? '' : '(login required)'}</h3>
        <form onSubmit={create}>
          <input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} disabled={!canCreate || editingPost !== null} />
          <textarea placeholder="Content" value={content} onChange={(e)=>setContent(e.target.value)} disabled={!canCreate || editingPost !== null} />
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Image (optional)</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageSelect}
              disabled={!canCreate || editingPost !== null}
              style={{ marginBottom: '0.75rem' }}
            />
            <div className="muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: '0.75rem' }}>
              Accepted formats: JPG, JPEG, PNG, GIF, WEBP (Max 5MB)
            </div>
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
          <button type="submit" disabled={!canCreate || editingPost !== null}>Create Post</button>
          {!canCreate && <div className="muted" style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>Login to create or comment.</div>}
          {editingPost && <div className="muted" style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>Editing a post. Cancel to create new.</div>}
        </form>
      </div>
    </div>
  );
}
