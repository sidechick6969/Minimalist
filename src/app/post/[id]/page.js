'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PostDetail({ params }) {
  // Using React.use to unwrap params correctly in Next.js 15
  const unwrappedParams = use(params);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const [postRes, userRes] = await Promise.all([
          fetch(`/api/posts/${unwrappedParams.id}`),
          fetch('/api/user')
        ]);
        
        if (postRes.ok) {
          const data = await postRes.json();
          setPost(data.post);
        } else {
          setError('Post not found');
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        }
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [unwrappedParams.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${unwrappedParams.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/');
      } else {
        alert('Failed to delete post');
      }
    } catch (err) {
      alert('Error connecting to server');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="text-center mt-8">Loading post...</div>;
  if (error) return (
    <div className="text-center mt-8">
      <h2 style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{error}</h2>
      <Link href="/" className="btn btn-outline">Return Home</Link>
    </div>
  );
  if (!post) return null;

  const isAuthor = user?.id === post.authorId;

  return (
    <article style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 0' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {post.title}
        </h1>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--text-primary)' }}>
              {post.authorName.charAt(0).toUpperCase()}
            </div>
            <span>Written by <strong style={{ color: 'var(--text-primary)' }}>{post.authorName}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            {isAuthor && (
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="btn btn-ghost" 
                style={{ color: 'var(--error-color)', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      </header>

      <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
        {post.content}
      </div>
    </article>
  );
}
