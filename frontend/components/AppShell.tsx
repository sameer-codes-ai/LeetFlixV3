'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import GlobalSearch from './GlobalSearch';

const NAV_ITEMS = [
    { href: '/', icon: '⊞', label: 'Dashboard' },
    { href: '/', icon: '🎬', label: 'Shows' },
    { href: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
    { href: '/forum', icon: '💬', label: 'Discussions' },
    { href: '#profile', icon: '👤', label: 'Profile' },
];

interface AppShellProps {
    children: React.ReactNode;
    /** Highlight this sidebar item — e.g. 'Dashboard', 'Profile', etc. */
    activeNav?: string;
    /** User summary for sidebar bottom; if not given, pull from context */
    level?: number;
    xpToNext?: number;
}

export default function AppShell({ children, activeNav, level = 1, xpToNext = 2500 }: AppShellProps) {
    const { user } = useAuth();
    const pathname = usePathname();

    // Auto-detect active nav from pathname if not provided
    const active = activeNav || (() => {
        if (pathname.startsWith('/profile')) return 'Profile';
        if (pathname.startsWith('/leaderboard')) return 'Leaderboard';
        if (pathname.startsWith('/forum')) return 'Discussions';
        return 'Dashboard';
    })();

    // Build nav items with profile linking to current user
    const navItems = NAV_ITEMS.map(item => ({
        ...item,
        href: item.href === '#profile' && user ? `/profile/${user.id}` : item.href,
        active: item.label === active,
    }));

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* ===== SIDEBAR ===== */}
            <aside style={{
                width: '256px', flexShrink: 0,
                borderRight: '1px solid rgba(255,107,53,0.1)',
                background: '#0f1a0f',
                display: 'flex', flexDirection: 'column',
                height: '100vh', position: 'sticky', top: 0,
            }}>
                {/* Logo */}
                <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: '#ff6b35',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', boxShadow: '0 0 16px rgba(255,107,53,0.4)',
                    }}>
                        ⚡
                    </div>
                    <div>
                        <h1 style={{ fontSize: '18px', fontWeight: '900', color: '#ff6b35', letterSpacing: '-0.5px' }}>LeetFlix</h1>
                        <p style={{ fontSize: '11px', color: 'rgba(255,107,53,0.5)', fontWeight: '600' }}>Premium Member</p>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {navItems.map(item => (
                        <Link key={item.label} href={item.href}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '12px 16px', borderRadius: '12px',
                                textDecoration: 'none',
                                background: item.active ? 'rgba(255,107,53,0.1)' : 'transparent',
                                color: item.active ? '#ff6b35' : '#4a7a4a',
                                border: item.active ? '1px solid rgba(255,107,53,0.2)' : '1px solid transparent',
                                fontSize: '14px', fontWeight: '700',
                                transition: 'all 0.18s',
                            }}
                            onMouseEnter={(e) => { if (!item.active) { e.currentTarget.style.background = 'rgba(255,107,53,0.05)'; e.currentTarget.style.color = '#ff6b35'; } }}
                            onMouseLeave={(e) => { if (!item.active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4a7a4a'; } }}
                        >
                            <span style={{ fontSize: '16px' }}>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Level bar + Go Pro */}
                <div style={{ padding: '16px' }}>
                    <div style={{
                        background: 'rgba(255,107,53,0.05)', backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,107,53,0.2)', borderRadius: '14px', padding: '16px',
                    }}>
                        <p style={{ fontSize: '11px', fontWeight: '900', color: '#ff6b35', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
                            Level {level}
                        </p>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: '75%', background: '#ff6b35', boxShadow: '0 0 8px rgba(255,107,53,0.6)', borderRadius: '999px' }} />
                        </div>
                        <p style={{ fontSize: '10px', color: '#4a5e4a', marginTop: '8px' }}>{xpToNext.toLocaleString()} XP until next rank</p>
                    </div>
                    <button style={{
                        width: '100%', marginTop: '12px', padding: '12px',
                        borderRadius: '12px', border: 'none',
                        background: '#ff6b35', color: '#0f1a0f',
                        fontWeight: '900', fontSize: '14px', cursor: 'pointer',
                        boxShadow: '0 0 16px rgba(255,107,53,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        transition: 'filter 0.2s',
                    }}
                        onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}>
                        ⚡ Go Pro
                    </button>
                </div>
            </aside>

            {/* ===== MAIN AREA ===== */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                {children}
            </div>
        </div>
    );
}
