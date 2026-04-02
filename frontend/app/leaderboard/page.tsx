'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { leaderboardApi, showsApi } from '@/lib/api';
import { LeaderboardEntry, Show } from '@/lib/types';
import { Trophy, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

const MEDAL = ['🥇', '🥈', '🥉'];

// ─── Inner component uses useSearchParams ──────────────────────────────────────
function LeaderboardContent() {
    const searchParams = useSearchParams();
    const showId = searchParams.get('showId');

    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [shows, setShows] = useState<Show[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        showsApi.getAll().then((r) => setShows(r.data)).catch(() => { });
    }, []);

    useEffect(() => {
        setLoading(true);
        const fn = showId
            ? leaderboardApi.getShow(showId, page)
            : leaderboardApi.getGlobal(page);
        fn
            .then((r) => setEntries(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [showId, page]);

    const currentShow = shows.find((s) => s.id === showId);

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Trophy size={28} color="var(--accent-yellow)" />
                    <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>
                        {currentShow ? `${currentShow.name} Leaderboard` : 'Global Leaderboard'}
                    </h1>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    {currentShow ? `Top players for ${currentShow.name}` : 'Top players across all shows'}
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <Link
                    href="/leaderboard"
                    style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: '600',
                        background: !showId ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                        color: !showId ? 'white' : 'var(--text-secondary)',
                        border: `1px solid ${!showId ? 'var(--accent)' : 'var(--border)'}`,
                        transition: 'all 0.2s',
                    }}
                >
                    🌍 Global
                </Link>
                {shows.slice(0, 6).map((show) => (
                    <Link
                        key={show.id}
                        href={`/leaderboard?showId=${show.id}`}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '13px',
                            fontWeight: '600',
                            background: showId === show.id ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                            color: showId === show.id ? 'white' : 'var(--text-secondary)',
                            border: `1px solid ${showId === show.id ? 'var(--accent)' : 'var(--border)'}`,
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {show.name}
                    </Link>
                ))}
            </div>

            {/* Table */}
            <div className="glass" style={{ overflow: 'hidden' }}>
                {/* Header row */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '60px 1fr 120px 120px',
                        padding: '12px 24px',
                        background: 'rgba(255,255,255,0.03)',
                        borderBottom: '1px solid var(--border)',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                    }}
                >
                    <span>Rank</span>
                    <span>Player</span>
                    <span style={{ textAlign: 'center' }}>Quizzes</span>
                    <span style={{ textAlign: 'right' }}>Score</span>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Loading…
                    </div>
                ) : entries.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <Trophy size={40} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                        <p style={{ color: 'var(--text-muted)' }}>No entries yet. Take a quiz to appear here!</p>
                    </div>
                ) : (
                    entries.map((entry, i) => {
                        const globalRank = (page - 1) * 20 + i + 1;
                        return (
                            <div
                                key={entry.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '60px 1fr 120px 120px',
                                    padding: '16px 24px',
                                    borderBottom: i < entries.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                    background: globalRank <= 3 ? `rgba(99,102,241,${0.04 - i * 0.01})` : 'transparent',
                                    transition: 'background 0.2s',
                                    alignItems: 'center',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = globalRank <= 3 ? `rgba(99,102,241,${0.04 - i * 0.01})` : 'transparent')}
                            >
                                {/* Rank */}
                                <div style={{ fontWeight: '800', fontSize: '16px' }}>
                                    {globalRank <= 3 ? MEDAL[globalRank - 1] : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>#{globalRank}</span>
                                    )}
                                </div>

                                {/* Player */}
                                <Link
                                    href={`/profile/${entry.userId}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        textDecoration: 'none',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: `linear-gradient(135deg, hsl(${entry.userId.charCodeAt(0) * 10}, 70%, 45%), hsl(${entry.userId.charCodeAt(1) * 10}, 70%, 55%))`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            fontWeight: '700',
                                            color: 'white',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {entry.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                            {entry.username}
                                        </p>
                                        {globalRank === 1 && (
                                            <span style={{ fontSize: '11px', color: 'var(--accent-yellow)', fontWeight: '600' }}>
                                                👑 Champion
                                            </span>
                                        )}
                                    </div>
                                </Link>

                                {/* Quizzes */}
                                <div style={{ textAlign: 'center' }}>
                                    <span className="badge badge-cyan" style={{ fontSize: '12px' }}>
                                        {entry.quizzesAttempted}
                                    </span>
                                </div>

                                {/* Score */}
                                <div style={{ textAlign: 'right' }}>
                                    <span
                                        style={{
                                            fontSize: '18px',
                                            fontWeight: '900',
                                            color: globalRank === 1 ? 'var(--accent-yellow)' : globalRank === 2 ? '#94a3b8' : globalRank === 3 ? '#f97316' : 'var(--accent-light)',
                                        }}
                                    >
                                        {entry.totalScore.toLocaleString()}
                                    </span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>pts</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
                <button
                    className="btn-secondary"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                    <ChevronLeft size={16} />
                    Prev
                </button>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Page {page}
                </span>
                <button
                    className="btn-secondary"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={entries.length < 20}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                    Next
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}

// ─── Outer page wraps in Suspense (required for useSearchParams in Next.js) ────
export default function LeaderboardPage() {
    return (
        <Suspense fallback={
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading leaderboard…
            </div>
        }>
            <LeaderboardContent />
        </Suspense>
    );
}
