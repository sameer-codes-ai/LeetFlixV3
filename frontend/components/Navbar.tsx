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
        <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100, border: 'none' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>

                {/* Left side - Logo and Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
                        <span style={{ fontSize: '16px', color: 'white' }}>❋</span>
                        <span style={{
                            fontSize: '15px', fontWeight: '900', letterSpacing: '0.5px', color: 'white', textTransform: 'uppercase'
                        }}>
                            LEETFLIX.
                        </span>
                    </Link>

                    <span style={{ color: 'var(--text-muted)', fontSize: '15px', padding: '0 8px' }}>/</span>

                    <div className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                style={{
                                    textDecoration: 'none',
                                    color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600',
                                    textTransform: 'uppercase', letterSpacing: '1px',
                                    transition: 'color 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                {link.label};
                            </Link>
                        ))}
                        {isAdmin && (
                            <Link
                                href="/admin"
                                style={{
                                    textDecoration: 'none',
                                    color: '#fbbf24', fontSize: '11px', fontWeight: '600',
                                    textTransform: 'uppercase', letterSpacing: '1px',
                                }}
                            >
                                ADMIN;
                            </Link>
                        )}
                    </div>
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
                                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                    textDecoration: 'none', color: 'white', fontSize: '13px', fontWeight: '700',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                            >
                                <div style={{
                                    width: '26px', height: '26px', borderRadius: '50%',
                                    background: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '12px', fontWeight: '900', color: 'black',
                                }}>{user.username.charAt(0).toUpperCase()}</div>
                                {user.username}
                            </Link>
                            <button
                                onClick={logout}
                                style={{
                                    padding: '7px 12px', borderRadius: '8px', border: '1px solid var(--border)',
                                    background: 'transparent', color: 'var(--text-secondary)',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                                    fontSize: '13px', transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                            >
                                <LogOut size={13} />
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
