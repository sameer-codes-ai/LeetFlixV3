'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { Tv, Trophy, MessageSquare, User, Shield, LogOut, Zap } from 'lucide-react';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const [avatarHover, setAvatarHover] = useState(false);
    // Suppress auth-dependent content until client hydration is complete
    // to avoid React hydration mismatch (server always has user=null)
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);


    const navLinks = [
        { href: '/', label: 'Shows' },
        { href: '/leaderboard', label: 'Leaderboard' },
        { href: '/forum', label: 'Community' },
    ];

    return (
        <nav className="navbar">
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <div style={{
                        width: '34px', height: '34px',
                        background: 'linear-gradient(135deg, #ff6b35, #c084fc)',
                        borderRadius: '9px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 16px rgba(255,107,53,0.4)',
                    }}>
                        <Zap size={18} color="white" fill="white" />
                    </div>
                    <span style={{
                        fontSize: '19px', fontWeight: '900', letterSpacing: '-0.5px',
                        background: 'linear-gradient(135deg, #ff6b35, #c084fc)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        LEETFLIX
                    </span>
                </Link>

                {/* Nav links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            style={{
                                padding: '7px 14px', borderRadius: '8px', textDecoration: 'none',
                                color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#ff6b35';
                                e.currentTarget.style.background = 'rgba(255,107,53,0.08)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--text-secondary)';
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {isAdmin && (
                        <Link
                            href="/admin"
                            style={{
                                padding: '7px 14px', borderRadius: '8px', textDecoration: 'none',
                                color: '#fbbf24', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', gap: '5px',
                            }}
                        >
                            <Shield size={14} />
                            Admin
                        </Link>
                    )}
                </div>

                {/* Auth — suppressed until client mounts to avoid hydration mismatch */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {mounted && user ? (
                        <>
                            <Link
                                href={`/profile/${user.id}`}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '6px 14px 6px 8px', borderRadius: '999px',
                                    background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.25)',
                                    textDecoration: 'none', color: '#ff6b35', fontSize: '13px', fontWeight: '700',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,107,53,0.18)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,107,53,0.1)'; }}
                            >
                                <div style={{
                                    width: '26px', height: '26px', borderRadius: '50%',
                                    background: `linear-gradient(135deg, #ff6b35, #8b5cf6)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '12px', fontWeight: '900', color: 'white',
                                }}>
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                {user.username}
                            </Link>
                            <button
                                onClick={logout}
                                style={{
                                    padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'transparent', color: 'var(--text-secondary)',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                                    fontSize: '13px', transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)'; e.currentTarget.style.color = '#f87171'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                            >
                                <LogOut size={13} />
                                Out
                            </button>
                        </>
                    ) : mounted ? (
                        <>
                            <Link href="/login" style={{ padding: '7px 16px', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600', transition: 'color 0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                            >
                                Sign in
                            </Link>
                            <Link href="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 20px', fontSize: '13px' }}>
                                Get Started
                            </Link>
                        </>
                    ) : null}
                </div>

            </div>
        </nav>
    );
}
