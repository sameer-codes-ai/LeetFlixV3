'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { showsApi } from '@/lib/api';
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
          border: `1px solid ${hovered ? 'rgba(255,107,53,0.5)' : 'rgba(255,255,255,0.06)'}`,
          background: '#162418',
          transition: 'border-color 0.25s, transform 0.25s',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden', background: `linear-gradient(145deg, ${g1}40, ${g2}60)` }}>
          {show.posterUrl ? (
            <img src={show.posterUrl} alt={show.name}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.5s' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '72px', fontWeight: '900', color: 'rgba(255,255,255,0.18)', userSelect: 'none' }}>{initial}</span>
            </div>
          )}
          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(15,26,15,0.8)', backdropFilter: 'blur(8px)', padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: '900', color: '#ff6b35', border: '1px solid rgba(255,107,53,0.3)', textTransform: 'uppercase' }}>
            {seasonCount > 0 ? 'New Quiz' : 'Soon'}
          </div>
        </div>
        <div style={{ padding: '12px 14px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: hovered ? '#ff6b35' : 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color 0.2s', marginBottom: '2px' }}>{show.name}</h3>
          <p style={{ fontSize: '12px', color: '#4a5e4a' }}>
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
  const [filtered, setFiltered] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    showsApi.getAll()
      .then((res) => { setShows(res.data); setFiltered(res.data); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(shows); }
    else { setFiltered(shows.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))); }
  }, [search, shows]);

  return (
    <div>
      {/* ===== HERO ===== */}
      {!user ? (
        <header className="hero-section" style={{ position: 'relative', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop')`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.35 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,26,15,0.2) 0%, rgba(15,26,15,0.55) 50%, #0f1a0f 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,107,53,0.08), transparent)' }} />

          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '820px', padding: '0 24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 16px', borderRadius: '999px', background: 'rgba(57,255,20,0.12)', border: '1px solid rgba(57,255,20,0.25)', marginBottom: '28px' }}>
              <span style={{ position: 'relative', width: '8px', height: '8px', borderRadius: '50%', background: '#39ff14', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '2px', color: '#39ff14', textTransform: 'uppercase' }}>Live Quizzes Active Now</span>
            </div>
            <h1 style={{ fontSize: 'clamp(56px,9vw,100px)', fontWeight: '900', lineHeight: 1.0, letterSpacing: '-3px', color: 'white', marginBottom: '24px', paddingBottom: '8px' }}>
              Level Up Your{' '}
              <span style={{ fontStyle: 'italic', background: 'linear-gradient(90deg, #ff6b35, #c084fc, #39ff14)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', paddingRight: '12px' }}>Binge</span>
            </h1>
            <p style={{ fontSize: '18px', color: '#94a394', maxWidth: '560px', margin: '0 auto 44px', lineHeight: 1.7 }}>
              The gamified quiz platform for TV show enthusiasts. Prove your fan status, climb the ranks, and earn exclusive badges for your favourite series.
            </p>
            <div className="hero-buttons" style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 44px', borderRadius: '12px', background: '#ff6b35', color: '#0f1a0f', fontWeight: '900', fontSize: '17px', textDecoration: 'none', boxShadow: '0 0 40px rgba(255,107,53,0.4)', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.12)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                Start Playing
              </Link>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 44px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontWeight: '700', fontSize: '17px', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}>
                Explore Shows
              </Link>
            </div>
          </div>
        </header>
      ) : (
        <header className="section-padding" style={{ paddingTop: '40px', paddingBottom: 0, marginBottom: '40px' }}>
          <div className="hero-featured-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {shows.slice(0, 2).map((show, idx) => {
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
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>{user ? 'Browse Shows' : 'Featured Series'}</h2>
            <p style={{ color: '#4a5e4a', marginTop: '4px', fontSize: '14px' }}>Join the active quiz arenas for these trending shows</p>
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

      {/* ===== LEADERBOARD + HEATMAP TEASER (guest only) ===== */}
      {!user && (
        <>
          <section className="section-padding home-two-col" style={{ paddingBottom: '80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div style={{ background: 'rgba(255,107,53,0.03)', border: '1px solid rgba(255,107,53,0.1)', borderRadius: '24px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, padding: '32px', color: 'rgba(255,107,53,0.07)', fontSize: '120px', lineHeight: 1, pointerEvents: 'none' }}>🏆</div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#ff6b35' }}>📊</span> Global Top Rank
              </h2>
              {[
                { rank: '01', name: 'Alex_Vance', title: 'Master of Mystery', score: '42,900 XP', top: true },
                { rank: '02', name: 'CinematicQueen', title: 'Drama Specialist', score: '38,150 XP', top: false },
                { rank: '03', name: 'The_Cooker', title: 'Culinary Buff', score: '35,200 XP', top: false },
              ].map((p) => (
                <div key={p.rank} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '12px', marginBottom: '10px', background: p.top ? 'rgba(255,107,53,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${p.top ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '900', fontStyle: 'italic', color: p.top ? '#ff6b35' : '#4a5e4a', minWidth: '28px' }}>{p.rank}</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b35, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '900', border: p.top ? '2px solid #ff6b35' : 'none' }}>{p.name.charAt(0)}</div>
                    <div>
                      <p style={{ fontWeight: '700', color: 'white', fontSize: '14px' }}>{p.name}</p>
                      <p style={{ fontSize: '11px', color: '#4a5e4a' }}>{p.title}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '700', color: p.top ? '#ff6b35' : 'white', fontSize: '13px' }}>{p.score}</p>
                  </div>
                </div>
              ))}
              <Link href="/leaderboard" style={{ display: 'block', textAlign: 'center', marginTop: '16px', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,107,53,0.2)', color: '#ff6b35', fontSize: '13px', fontWeight: '700', textDecoration: 'none', transition: 'background 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,107,53,0.07)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                View Full Global Leaderboard
              </Link>
            </div>
            <div style={{ background: 'rgba(139,92,246,0.03)', border: '1px solid rgba(139,92,246,0.1)', borderRadius: '24px', padding: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#8b5cf6' }}>📈</span> Watching Activity
              </h2>
              <p style={{ color: '#4a5e4a', fontSize: '13px', marginBottom: '20px' }}>Track your quiz streaks and knowledge growth across all genres.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[...Array(7)].map((_, row) => (
                  <div key={row} style={{ display: 'flex', gap: '4px' }}>
                    {[...Array(20)].map((_, col) => {
                      const intensity = Math.random();
                      const alpha = intensity > 0.7 ? 0.9 : intensity > 0.5 ? 0.6 : intensity > 0.3 ? 0.3 : 0.1;
                      return (
                        <div key={col} style={{ width: '12px', height: '12px', borderRadius: '2px', background: intensity > 0.5 ? `rgba(255,107,53,${alpha})` : `rgba(139,92,246,${alpha * 0.8})` }} />
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="stats-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
                {[{ label: 'WEEKLY STREAK', value: '14 Days' }, { label: 'TOTAL QUIZZES', value: '342 📈' }].map(stat => (
                  <div key={stat.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
                    <p style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1.5px', color: '#4a5e4a', textTransform: 'uppercase', marginBottom: '4px' }}>{stat.label}</p>
                    <p style={{ fontSize: '24px', fontWeight: '900', color: 'white' }}>{stat.value.split(' ')[0]} <span style={{ fontSize: '14px', fontWeight: '700', color: '#ff6b35' }}>{stat.value.split(' ')[1]}</span></p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section-padding" style={{ paddingBottom: '80px' }}>
            <div className="home-cta-section" style={{ borderRadius: '28px', overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, #ff6b35, #c084fc)', padding: '80px', textAlign: 'center' }}>
              <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: '900', color: '#0f1a0f', marginBottom: '20px', maxWidth: '600px', margin: '0 auto 20px' }}>
                Ready to claim the Iron Throne of TV knowledge?
              </h2>
              <p style={{ color: 'rgba(15,26,15,0.75)', fontSize: '16px', marginBottom: '36px', maxWidth: '500px', margin: '0 auto 36px' }}>
                Join 50,000+ fans competing daily. New challenges added for every episode release.
              </p>
              <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 36px', borderRadius: '12px', background: '#0f1a0f', color: '#ff6b35', fontWeight: '900', fontSize: '16px', textDecoration: 'none', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                Get Early Access
              </Link>
            </div>
          </section>
        </>
      )}

      <footer className="footer-bar section-padding" style={{ borderTop: '1px solid rgba(255,107,53,0.08)', paddingTop: '40px', paddingBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.5 }}>
          <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px', color: '#ff6b35' }}>LEETFLIX</span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Privacy', 'Terms', 'Contact', 'Twitter'].map(l => (
            <a key={l} href="#" style={{ fontSize: '13px', color: '#4a5e4a', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ff6b35'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#4a5e4a'; }}>
              {l}
            </a>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: '#2a3a2a', fontStyle: 'italic' }}>© 2024 LeetFlix Media Group. Stay curious.</p>
      </footer>
    </div>
  );
}
