'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { Shield, LogOut, Zap, Menu, X } from 'lucide-react';
import GlobalSearch from './GlobalSearch';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    // Close mobile menu on route change (link click)
    const closeMobile = () => setMobileOpen(false);

    const navLinks = [
        { href: '/', label: 'Shows' },
        { href: '/leaderboard', label: 'Leaderboard' },
        { href: '/forum', label: 'Community' },
    ];

    return (
        <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>

                {/* Logo — always visible */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
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

                {/* Desktop nav links */}
                <div className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
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

                {/* Desktop search */}
                <div className="nav-desktop-search">
                    <GlobalSearch />
                </div>

                {/* Desktop auth */}
                <div className="nav-desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
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
                                    background: 'linear-gradient(135deg, #ff6b35, #8b5cf6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '12px', fontWeight: '900', color: 'white',
                                }}>{user.username.charAt(0).toUpperCase()}</div>
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
                            <Link href="/login" style={{ padding: '7px 16px', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600' }}>
                                Sign in
                            </Link>
                            <Link href="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 20px', fontSize: '13px' }}>
                                Get Started
                            </Link>
                        </>
                    ) : null}
                </div>

                {/* Mobile hamburger toggle */}
                <button className="nav-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile dropdown panel */}
            <div className={`nav-mobile-panel ${mobileOpen ? 'open' : ''}`}>
                {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={closeMobile}>
                        {link.label}
                    </Link>
                ))}
                {isAdmin && (
                    <Link href="/admin" onClick={closeMobile} style={{ color: '#fbbf24' }}>
                        <Shield size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
                        Admin
                    </Link>
                )}
                <div style={{ padding: '8px 0' }}>
                    <GlobalSearch />
                </div>
                {mounted && user ? (
                    <>
                        <Link href={`/profile/${user.id}`} onClick={closeMobile} style={{ color: '#ff6b35', fontWeight: '700' }}>
                            👤 {user.username}
                        </Link>
                        <button
                            onClick={() => { closeMobile(); logout(); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', fontWeight: '600' }}
                        >
                            <LogOut size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
                            Sign out
                        </button>
                    </>
                ) : mounted ? (
                    <>
                        <Link href="/login" onClick={closeMobile}>Sign in</Link>
                        <Link href="/register" onClick={closeMobile} style={{ color: '#ff6b35', fontWeight: '700' }}>
                            Get Started →
                        </Link>
                    </>
                ) : null}
            </div>
        </nav>
    );
}
