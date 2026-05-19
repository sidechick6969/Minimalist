'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Trash2, Users, BookOpen, UserCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndFetchData() {
      try {
        // 1. Fetch current user session
        const userRes = await fetch('/api/user');
        if (!userRes.ok) {
          router.push('/admin/login');
          return;
        }
        
        const userData = await userRes.json();
        if (!userData.user || !userData.user.isAdmin) {
          router.push('/admin/login');
          return;
        }
        
        setAdminUser(userData.user);

        // 2. Fetch admin users list and posts list
        const [usersRes, postsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/posts')
        ]);

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users);
        } else {
          setError('Failed to load user list.');
        }

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData.posts || []);
        }
      } catch (err) {
        console.error(err);
        setError('An unexpected error occurred while loading dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndFetchData();
  }, [router]);

  const handleDeleteUser = async (userId, userName) => {
    if (userId === adminUser.id) {
      alert("You cannot delete your own admin account.");
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${userName}"? This will also delete all of their blog posts.`)) {
      return;
    }

    setDeletingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        // Remove deleted user's posts from local posts list representation
        setPosts(prev => prev.filter(p => p.authorId !== userId));
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to delete user.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAdminLoginRedirect = async () => {
    // Log out current user and send them to admin login redirect
    await fetch('/api/logout', { method: 'POST' });
    window.dispatchEvent(new Event('auth-change'));
    router.push('/login?redirectTo=/admin');
  };

  if (loading) {
    return <div className="text-center mt-12">Loading Admin Portal...</div>;
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }} className="card">
        <h2 style={{ color: 'var(--error-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Shield size={28} /> Access Denied
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link href="/" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={16} /> Home
          </Link>
          <button 
            onClick={handleAdminLoginRedirect} 
            className="btn btn-primary"
          >
            Log in as Admin
          </button>
        </div>
      </div>
    );
  }

  // Stats calculations
  const totalUsers = users.length;
  const totalPosts = posts.length;
  const totalAdmins = users.filter(u => u.isAdmin).length;

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>System Administration</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.25rem', letterSpacing: '-0.02em' }}>Admin Dashboard</h1>
        </div>
        <Link href="/" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Home
        </Link>
      </div>

      {/* Stats Cards Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '3rem' 
      }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', borderLeft: '4px solid var(--text-primary)' }}>
          <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', padding: '0.75rem', borderRadius: '8px' }}>
            <Users size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>Total Registered Users</h3>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>{totalUsers}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', borderLeft: '4px solid var(--accent-color)' }}>
          <div style={{ backgroundColor: '#EFF6FF', color: 'var(--accent-color)', padding: '0.75rem', borderRadius: '8px' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>Total Published Posts</h3>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>{totalPosts}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', borderLeft: '4px solid var(--text-secondary)' }}>
          <div style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)', padding: '0.75rem', borderRadius: '8px' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>Administrators</h3>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>{totalAdmins}</p>
          </div>
        </div>
      </div>

      {/* Users Directory Table */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.01em' }}>User Directory</h2>
      <div className="card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border-color)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Name</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Email Address</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Account Role</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      backgroundColor: user.isAdmin ? '#EFF6FF' : '#F3F4F6', 
                      color: user.isAdmin ? 'var(--accent-color)' : 'var(--text-secondary)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{user.name}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{user.email}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  {user.isAdmin ? (
                    <span style={{ 
                      backgroundColor: '#EFF6FF', 
                      color: '#1E40AF', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase'
                    }}>Admin</span>
                  ) : (
                    <span style={{ 
                      backgroundColor: '#F3F4F6', 
                      color: '#374151', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      fontWeight: 500,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase'
                    }}>User</span>
                  )}
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  {user.id !== adminUser?.id ? (
                    <button 
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      disabled={deletingId === user.id}
                      className="btn btn-ghost"
                      style={{ 
                        color: 'var(--error-color)', 
                        padding: '0.5rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px'
                      }}
                      title="Delete User & Posts"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', paddingRight: '0.5rem' }}>Current User</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
