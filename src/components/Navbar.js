'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { PenSquare, LogOut, User, Shield } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const clickTimeoutRef = useRef(null);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    
    // Listen for custom event to update nav
    const handleAuthChange = () => fetchUser();
    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const handleLogoClick = (e) => {
    e.preventDefault(); // Prevent standard navigation immediately
    
    const now = Date.now();
    let currentCount = clickCount;

    if (now - lastClickTime > 1500) {
      currentCount = 1;
    } else {
      currentCount = clickCount + 1;
    }

    setClickCount(currentCount);
    setLastClickTime(now);

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    if (currentCount >= 5) {
      router.push('/admin/login');
      setClickCount(0);
      clickTimeoutRef.current = null;
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        router.push('/');
        setClickCount(0);
        clickTimeoutRef.current = null;
      }, 250);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
  };

  useEffect(() => {
    if (user?.isAdmin && pathname && !pathname.startsWith('/admin')) {
      handleLogout();
    }
  }, [pathname, user]);

  return (
    <header style={{
      padding: '1.5rem',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-secondary)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link 
          href="/" 
          onClick={handleLogoClick}
          style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', userSelect: 'none' }}
        >
          Minimalist.
        </Link>
        
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {!loading && user ? (
            <>
              <Link href="/write" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <PenSquare size={16} style={{ marginRight: '0.5rem' }} />
                Write
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--text-secondary)' }} title="Logout">
                <LogOut size={18} />
              </button>
            </>
          ) : !loading ? (
            <>
              <Link href="/login" className="btn btn-ghost">Log in</Link>
              <Link href="/signup" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Sign up</Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
