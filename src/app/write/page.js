'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Write() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Basic auth check
    fetch('/api/user').then(res => {
      if (!res.ok) router.push('/login');
    });
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/post/${data.post.id}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to publish post');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 700 }}>
        Write a new post
      </h1>
      
      {error && <div className="form-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group mb-4">
          <input
            type="text"
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            style={{ fontSize: '1.5rem', fontWeight: 600, padding: '1rem', border: 'none', borderBottom: '1px solid var(--border-color)', borderRadius: '0', backgroundColor: 'transparent' }}
          />
        </div>

        <div className="form-group mb-8">
          <textarea
            placeholder="Write your story here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="form-input"
            style={{ 
              minHeight: '400px', 
              resize: 'vertical', 
              fontSize: '1.1rem', 
              lineHeight: '1.8',
              border: 'none',
              backgroundColor: 'transparent',
              padding: '1rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" onClick={() => router.back()} className="btn btn-ghost">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  );
}
