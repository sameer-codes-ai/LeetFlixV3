'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usersApi } from '@/lib/api';

export default function GlobalSearch({ compact = false }: { compact?: boolean }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [focused, setFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setFocused(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleChange = (v: string) => {
        setQuery(v);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (v.trim().length === 0) { setResults([]); return; }
        timeoutRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const r = await usersApi.search(v);
                setResults(r.data);
            } catch {
                setResults([]);
            }
            setLoading(false);
        }, 300);
    };

    const showDropdown = focused && query.trim().length > 0;

    return (
        <div ref={containerRef} style={{ position: 'relative', flex: compact ? undefined : 1, maxWidth: compact ? '260px' : '380px', width: '100%' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4a5e4a', fontSize: '14px', pointerEvents: 'none' }}>🔍</span>
            <input
                type="text"
                placeholder="Search users..."
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={() => setFocused(true)}
                style={{
                    width: '100%', padding: '9px 14px 9px 36px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,107,53,0.12)',
                    borderRadius: '10px', color: 'var(--text-primary)',
                    fontSize: '13px', outline: 'none', fontFamily: 'inherit',
                    transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,107,53,0.3)'; }}
                onMouseLeave={(e) => { if (!focused) (e.target as HTMLInputElement).style.borderColor = 'rgba(255,107,53,0.12)'; }}
            />

            {/* Dropdown */}
            {showDropdown && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                    background: '#162418', border: '1px solid rgba(255,107,53,0.2)',
                    borderRadius: '12px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                    zIndex: 999, maxHeight: '300px', overflowY: 'auto',
                }}>
                    {loading ? (
                        <p style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Searching...</p>
                    ) : results.length === 0 ? (
                        <p style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No users found</p>
                    ) : results.map((u: any) => (
                        <Link
                            key={u.id}
                            href={`/profile/${u.id}`}
                            onClick={() => { setFocused(false); setQuery(''); setResults([]); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '12px 16px', textDecoration: 'none',
                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,107,53,0.08)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: 'linear-gradient(135deg,#ff6b35,#8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: '900', fontSize: '13px', color: 'white', flexShrink: 0,
                            }}>
                                {u.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p style={{ fontWeight: '700', fontSize: '13px', color: 'white' }}>{u.username}</p>
                                <p style={{ fontSize: '11px', color: '#ff6b35', fontWeight: '600' }}>{u.totalScore?.toLocaleString() || 0} XP</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
