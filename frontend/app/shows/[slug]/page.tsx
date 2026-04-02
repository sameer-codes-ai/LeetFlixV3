'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { showsApi } from '@/lib/api';
import { Show } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

const GRADIENT_COVERS: [string, string][] = [
    ['#ff6b35', '#c084fc'],
    ['#8b5cf6', '#06b6d4'],
    ['#f97316', '#ef4444'],
    ['#10b981', '#059669'],
];

export default function ShowPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const { user } = useAuth();

    const [show, setShow] = useState<Show | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        showsApi.getBySlug(slug)
            .then((res) => setShow(res.data))
            .catch(() => router.push('/'))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return (
        <div>
            <div className="skeleton" style={{ height: '60vh', borderRadius: 0 }} />
            <div style={{ padding: '48px 80px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '400px', borderRadius: '12px' }} />)}
            </div>
        </div>
    );

    if (!show) return null;
    const posterUrl = (show as any).posterUrl;

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* ===== HERO BANNER (60-75vh) — matches reference exactly ===== */}
            <section style={{ position: 'relative', height: '65vh', width: '100%', overflow: 'hidden' }}>
                {/* Background + overlay */}
                <div
                    style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: posterUrl
                            ? `linear-gradient(to top, #0f1a0f 0%, transparent 40%, rgba(15,26,15,0.4) 100%), url('${posterUrl}')`
                            : `linear-gradient(135deg, rgba(255,107,53,0.2), rgba(139,92,246,0.2), rgba(15,26,15,1))`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center top',
                        transition: 'transform 0.7s',
                    }}
                />
                {/* Content anchored to bottom-left */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '48px 80px' }}>
                    <div style={{ maxWidth: '700px' }}>
                        {/* Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                            <span style={{
                                background: 'rgba(255,107,53,0.2)', color: '#ff6b35', border: '1px solid #ff6b35',
                                padding: '2px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: '900',
                                textTransform: 'uppercase', letterSpacing: '1.5px',
                            }}>
                                LeetFlix Original
                            </span>
                            <span style={{ color: '#94a394', fontSize: '13px', fontWeight: '500' }}>
                                {show.seasons?.length ?? 0} Season{(show.seasons?.length ?? 0) !== 1 ? 's' : ''}
                            </span>
                        </div>
                        {/* Title */}
                        <h1 style={{
                            fontSize: 'clamp(42px,6vw,80px)', fontWeight: '900',
                            letterSpacing: '-2px', color: 'white',
                            textTransform: 'uppercase', fontStyle: 'italic',
                            lineHeight: 0.9, marginBottom: '16px',
                        }}>
                            {show.name}
                        </h1>
                        {show.description && (
                            <p style={{ color: '#cbd5cb', fontSize: '16px', lineHeight: 1.65, maxWidth: '580px', marginBottom: '28px' }}>
                                {show.description}
                            </p>
                        )}
                        {/* CTA Buttons */}
                        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                            {user && show.seasons && show.seasons.length > 0 && (
                                <Link
                                    href={`/shows/${slug}/quiz/${show.seasons[0].id}?showId=${show.id}`}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                                        padding: '12px 28px', borderRadius: '8px',
                                        background: '#ff6b35', color: '#0f1a0f',
                                        fontWeight: '900', fontSize: '15px', textDecoration: 'none',
                                        boxShadow: '0 0 24px rgba(255,107,53,0.35)',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                                >
                                    ▶ Start S1:E1
                                </Link>
                            )}
                            {user && show.seasons && show.seasons.length > 1 && (
                                <Link
                                    href={`/shows/${slug}/quiz/all?showId=${show.id}`}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                                        padding: '12px 28px', borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #8b5cf6, #c084fc)',
                                        color: 'white',
                                        fontWeight: '900', fontSize: '15px', textDecoration: 'none',
                                        boxShadow: '0 0 24px rgba(139,92,246,0.35)',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.15)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                                >
                                    🎯 All Seasons Quiz
                                </Link>
                            )}
                            {!user && (
                                <Link
                                    href="/login"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                                        padding: '12px 28px', borderRadius: '8px',
                                        background: '#ff6b35', color: '#0f1a0f',
                                        fontWeight: '900', fontSize: '15px', textDecoration: 'none',
                                    }}
                                >
                                    ▶ Sign in to Play
                                </Link>
                            )}
                            <button style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '12px 28px', borderRadius: '8px',
                                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white', fontWeight: '700', fontSize: '15px', cursor: 'pointer',
                            }}>
                                + My List
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SEASONS SECTION ===== */}
            <section style={{ padding: '48px 80px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,107,53,0.1)' }}>
                    <div>
                        <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>Available Seasons</h2>
                        <p style={{ color: '#94a394', marginTop: '4px' }}>Challenge yourself with progressive difficulty tiers.</p>
                    </div>
                </div>

                {/* 4-column season grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                    {(!show.seasons || show.seasons.length === 0) ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#4a5e4a' }}>
                            No seasons uploaded yet.
                        </div>
                    ) : show.seasons.sort((a, b) => a.order - b.order).map((season, idx) => {
                        const [g1, g2] = GRADIENT_COVERS[idx % GRADIENT_COVERS.length];
                        return (
                            <div
                                key={season.id}
                                style={{
                                    display: 'flex', flexDirection: 'column',
                                    background: 'rgba(30,40,30,0.4)', borderRadius: '12px',
                                    overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)',
                                    transition: 'border-color 0.25s, transform 0.25s',
                                }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,107,53,0.5)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                            >
                                {/* Season cover image */}
                                <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: `linear-gradient(145deg, ${g1}60, ${g2}80)` }}>
                                    {posterUrl && (
                                        <img src={posterUrl} alt={season.name}
                                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s', opacity: 0.75 }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.1)'; }}
                                            onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
                                        />
                                    )}
                                    {/* Season category badge */}
                                    <div style={{
                                        position: 'absolute', top: '12px', left: '12px',
                                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                                        padding: '3px 9px', borderRadius: '4px',
                                        fontSize: '9px', fontWeight: '900', color: '#ff6b35',
                                        border: '1px solid rgba(255,107,53,0.3)', textTransform: 'uppercase', letterSpacing: '1px',
                                    }}>
                                        Season {idx + 1}
                                    </div>
                                    {/* Bottom gradient */}
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(15,26,15,1), transparent)' }} />
                                </div>

                                {/* Card body */}
                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>{season.name}</h3>
                                        <span style={{ color: '#ff6b35', fontWeight: '800', fontSize: '14px' }}>—</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a394', fontSize: '13px' }}>
                                            <span>📋</span>
                                            <span>{season.questionCount} Question{season.questionCount !== 1 ? 's' : ''}</span>
                                        </div>
                                        {/* Progress bar */}
                                        <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: '0%', background: '#ff6b35', borderRadius: '999px' }} />
                                        </div>
                                    </div>
                                    {/* CTA button */}
                                    {user && season.questionCount > 0 ? (
                                        <Link
                                            href={`/shows/${slug}/quiz/${season.id}?showId=${show.id}`}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                padding: '10px', borderRadius: '8px',
                                                background: 'rgba(255,107,53,0.1)', color: '#ff6b35',
                                                fontWeight: '800', fontSize: '13px', textDecoration: 'none',
                                                border: '1px solid rgba(255,107,53,0.2)',
                                                transition: 'all 0.2s', marginTop: 'auto',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#ff6b35'; e.currentTarget.style.color = '#0f1a0f'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,107,53,0.1)'; e.currentTarget.style.color = '#ff6b35'; }}
                                        >
                                            ▶ Start Quiz
                                        </Link>
                                    ) : !user ? (
                                        <Link
                                            href="/login"
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                padding: '10px', borderRadius: '8px',
                                                background: 'rgba(255,107,53,0.1)', color: '#ff6b35',
                                                fontWeight: '800', fontSize: '13px', textDecoration: 'none',
                                                border: '1px solid rgba(255,107,53,0.2)', marginTop: 'auto',
                                            }}
                                        >
                                            🔒 Sign in to Play
                                        </Link>
                                    ) : (
                                        <div style={{ padding: '10px', textAlign: 'center', color: '#4a5e4a', fontSize: '13px', fontWeight: '700', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', marginTop: 'auto' }}>
                                            No questions yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ===== DETAILS SECTION ===== */}
            {show.description && (
                <section style={{ padding: '48px 80px', borderTop: '1px solid rgba(255,107,53,0.08)', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '64px' }}>
                    <div>
                        <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>About {show.name}</h3>
                        <p style={{ color: '#cbd5cb', fontSize: '16px', lineHeight: 1.7 }}>{show.description}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <h4 style={{ fontSize: '11px', fontWeight: '800', color: '#4a5e4a', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>Total Seasons</h4>
                            <p style={{ color: 'white', fontWeight: '600' }}>{show.seasons?.length ?? 0}</p>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '11px', fontWeight: '800', color: '#4a5e4a', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>Total Points</h4>
                            <p style={{ color: '#ff6b35', fontWeight: '800' }}>{(show.seasons?.reduce((acc, s) => acc + s.questionCount, 0) ?? 0) * 10} XP Available</p>
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer style={{ borderTop: '1px solid rgba(255,107,53,0.08)', padding: '32px 80px', display: 'flex', justifyContent: 'center', gap: '32px' }}>
                {['Privacy Policy', 'Terms of Service', 'Help Center'].map(l => (
                    <a key={l} href="#" style={{ fontSize: '13px', color: '#4a5e4a', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#ff6b35'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#4a5e4a'; }}>
                        {l}
                    </a>
                ))}
            </footer>
        </div>
    );
}
