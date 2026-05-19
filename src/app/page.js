'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/posts');
        const data = await res.json();
        if (data.posts) {
          setPosts(data.posts);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading) {
    return <div className="text-center mt-8">Loading posts...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem', letterSpacing: '-0.03em' }}>
        Latest Readings
      </h1>
      
      {posts.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem 1.5rem' }}>
          <p>No posts published yet. Be the first to write something!</p>
          <Link href="/write" className="btn btn-primary mt-4">Write a post</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {posts.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`} style={{ display: 'block' }}>
              <article className="card">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{post.title}</h2>
                <p style={{ 
                  display: '-webkit-box', 
                  WebkitLineClamp: 3, 
                  WebkitBoxOrient: 'vertical', 
                  overflow: 'hidden',
                  marginBottom: '1rem'
                }}>
                  {post.content}
                </p>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>By {post.authorName}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
