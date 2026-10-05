'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { showsApi, leaderboardApi } from '@/lib/api';
import { Show } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { Search } from 'lucide-react';

const GRADIENT_PAIRS: [string, string][] = [
  ['#ff6b35', '#c084fc'],
  ['#8b5cf6', '#06b6d4'],
  ['#f97316', '#ef4444'],
  ['#10b981', '#059669'],
  ['#c084fc', '#8b5cf6'],
  ['#f472b6', '#ec4899'],
  ['#a78bfa', '#7c3aed'],
  ['#34d399', '#06b6d4'],
];

function ShowCard({ show, index }: { show: Show; index: number }) {
  const [g1, g2] = GRADIENT_PAIRS[index % GRADIENT_PAIRS.length];
  const initial = show.name.charAt(0).toUpperCase();
  const seasonCount = show.seasons?.length ?? 0;
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/shows/${show.slug}`} style={{ textDecoration: 'none', flex: '0 0 auto', width: '200px' }}>
      <div
        style={{
          borderRadius: '12px', overflow: 'hidden',
          border: `1px solid ${hovered ? 'var(--primary-border)' : 'var(--border)'}`,
          background: 'var(--bg-surface)',
          transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: hovered ? 'var(--primary-glow)' : 'none',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden', background: `linear-gradient(145deg, ${g1}20, ${g2}30)` }}>
          {show.posterUrl ? (
            <img src={show.posterUrl} alt={show.name}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.5s' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '72px', fontWeight: '900', color: 'rgba(0,0,0,0.05)', userSelect: 'none' }}>{initial}</span>
            </div>
          )}
          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: '900', color: '#ff6b35', border: '1px solid rgba(255,107,53,0.3)', textTransform: 'uppercase' }}>
            {seasonCount > 0 ? 'New Quiz' : 'Soon'}
          </div>
        </div>
        <div style={{ padding: '12px 14px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: hovered ? '#ff6b35' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color 0.2s', marginBottom: '2px' }}>{show.name}</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {seasonCount > 0 ? `${seasonCount} Season${seasonCount !== 1 ? 's' : ''}` : 'Coming Soon'}
            {seasonCount > 0 ? ' · Quiz' : ''}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      showsApi.getAll().then((res) => setShows(res.data)).catch(() => {}),
      leaderboardApi.getGlobal(1, 5).then((res) => setLeaderboard(res.data.leaderboard || res.data)).catch(() => {})
    ]).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return shows;
    const q = search.toLowerCase();
    return shows.filter((s) => s.name.toLowerCase().includes(q));
  }, [shows, search]);

  const newestShows = useMemo(() => {
    return [...shows]
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 2);
  }, [shows]);

  return (
    <div>
      {/* ===== HERO ===== */}
      {!user ? (
        <header className="hero-section" style={{ position: 'relative', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop')`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.1 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,10,10,0.5) 0%, var(--bg-base) 100%)' }} />

          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '900px', padding: '0 24px' }}>
            <h1 style={{ fontSize: 'clamp(40px,6vw,64px)', fontWeight: '600', lineHeight: 1.1, letterSpacing: '-1px', color: 'var(--text-primary)', marginBottom: '24px' }}>
              Experience next-gen trivia with LeetFlix
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 44px', lineHeight: 1.6 }}>
              Seamlessly blend your love for TV shows with competitive trivia for an enhanced entertainment experience in your daily life.
            </p>
            <div className="hero-buttons" style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" className="btn-primary" style={{ padding: '12px 24px', fontSize: '14px', borderRadius: '4px', fontWeight: '500' }}>
                Get Started
              </Link>
            </div>
          </div>
        </header>
      ) : (
        <header className="section-padding" style={{ paddingTop: '40px', paddingBottom: 0, marginBottom: '40px' }}>
          <div className="hero-featured-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {newestShows.map((show, idx) => {
              const seasonCount = show.seasons?.length ?? 0;
              return (
                <Link href={`/shows/${show.slug}`} key={show.id} style={{ position: 'relative', height: '45vh', minHeight: '340px', borderRadius: '16px', overflow: 'hidden', display: 'block', textDecoration: 'none' }}>
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: show.posterUrl ? `url('${show.posterUrl}')` : `linear-gradient(135deg, ${GRADIENT_PAIRS[idx % GRADIENT_PAIRS.length][0]}40, ${GRADIENT_PAIRS[idx % GRADIENT_PAIRS.length][1]}60)`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.8, transition: 'transform 0.5s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0f1a0f 0%, transparent 50%, rgba(15,26,15,0.2) 100%)' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ background: 'rgba(255,107,53,0.2)', color: '#ff6b35', border: '1px solid rgba(255,107,53,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', backdropFilter: 'blur(4px)' }}>Premium Original</span>
                      <span style={{ color: '#fff', fontSize: '12px', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        {seasonCount > 0 ? `${seasonCount} Season${seasonCount !== 1 ? 's' : ''}` : 'Coming Soon'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 'clamp(24px,3vw,42px)', fontWeight: '900', letterSpacing: '-1px', color: 'white', fontStyle: 'italic', textTransform: 'uppercase', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{show.name}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </header>
      )}

      {/* ===== FEATURED SERIES SECTION ===== */}
      <section className={user ? 'section-padding' : ''} style={{ paddingTop: 0, paddingBottom: '64px', marginTop: user ? '0' : '-40px', position: 'relative', zIndex: 10 }}>
        <div className={!user ? 'section-padding' : ''} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{user ? 'Browse Shows' : 'Featured Series'}</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>Join the active quiz arenas for these trending shows</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4a5e4a' }} />
              <input className="input" placeholder="Search shows…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '36px', width: '220px', background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,107,53,0.15)' }} />
            </div>
            <a href="#" style={{ color: '#ff6b35', fontSize: '13px', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>View all →</a>
          </div>
        </div>
        {loading ? (
          <div className={`show-card-scroll ${!user ? 'section-padding' : ''}`} style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
            {[...Array(7)].map((_, i) => (
              <div key={i} className="skeleton" style={{ flexShrink: 0, width: '200px', height: '360px', borderRadius: '12px' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: '#4a5e4a' }}>
            <p style={{ fontSize: '16px' }}>{search ? 'No shows match your search' : 'No shows yet — ask an admin to upload quiz content'}</p>
          </div>
        ) : (
          <div className={`fade-in show-card-scroll ${!user ? 'section-padding' : ''}`} style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '16px', scrollbarWidth: 'none' }}>
            {filtered.map((show, i) => <ShowCard key={show.id} show={show} index={i} />)}
          </div>
        )}
      </section>

      {/* ===== REAL LEADERBOARD ===== */}
      {!user && (
        <>
          <section className="section-padding" style={{ paddingBottom: '80px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '800px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                  <span style={{ color: '#ff6b35' }}>🏆</span> Global Top Rank
                </h2>
                <Link href="/leaderboard" style={{ color: '#ff6b35', fontSize: '14px', fontWeight: '700', textDecoration: 'none' }}>
                  View Full Leaderboard →
                </Link>
              </div>
              
              {leaderboard.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No ranking data available yet.</p>
              ) : (
                leaderboard.slice(0, 5).map((p: any, idx: number) => (
                  <div key={p.userId || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '12px', marginBottom: '10px', background: idx === 0 ? 'rgba(255,107,53,0.05)' : 'rgba(0,0,0,0.02)', border: `1px solid ${idx === 0 ? 'rgba(255,107,53,0.2)' : 'var(--border)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '900', fontStyle: 'italic', color: idx === 0 ? '#ff6b35' : 'var(--text-muted)', minWidth: '28px' }}>
                        {idx < 9 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b35, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '900', color: 'white', border: idx === 0 ? '2px solid #ff6b35' : 'none' }}>
                        {(p.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '14px' }}>{p.username || 'Unknown'}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.title || 'Player'}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: '700', color: idx === 0 ? '#ff6b35' : 'var(--text-primary)', fontSize: '13px' }}>{p.totalScore || p.score || 0} XP</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="section-padding" style={{ paddingBottom: '80px' }}>
            <div className="home-cta-section" style={{ borderRadius: '28px', overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, rgba(255,107,53,0.1), rgba(192,132,252,0.1))', border: '1px solid var(--border)', padding: '60px', textAlign: 'center' }}>
              <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '16px', maxWidth: '600px', margin: '0 auto 16px' }}>
                Ready to claim the Iron Throne of TV knowledge?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
                Join the fans competing daily. New challenges added for every episode release.
              </p>
              <Link href="/register" className="btn-primary" style={{ padding: '14px 36px', fontSize: '16px', color: '#fff' }}>
                Get Early Access
              </Link>
            </div>
          </section>
        </>
      )}

      <footer className="footer-bar section-padding" style={{ borderTop: '1px solid var(--border)', paddingTop: '40px', paddingBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7 }}>
          <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px', color: '#ff6b35' }}>LEETFLIX</span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Privacy', 'Terms', 'Contact', 'Twitter'].map(l => (
            <a key={l} href="#" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ff6b35'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}>
              {l}
            </a>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>© 2024 LeetFlix Media Group. Stay curious.</p>
      </footer>
    </div>
  );
}
