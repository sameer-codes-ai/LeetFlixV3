'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usersApi, activityApi, showsApi, socialApi } from '@/lib/api';
import { ActivityData, Attempt, Show } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

// ===== GitHub-style Heatmap =====
function ActivityHeatmap({ activity, year }: { activity: Record<string, number>; year: string }) {
    const CELL = 12;
    const GAP = 3;
    const STEP = CELL + GAP;

    const startDate = new Date(`${year}-01-01T00:00:00`);
    const endDate = new Date(`${year}-12-31T00:00:00`);

    const gridStart = new Date(startDate);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());

    const weeks: { date: string; count: number; inYear: boolean }[][] = [];
    let cur = new Date(gridStart);
    while (cur <= endDate) {
        const week: { date: string; count: number; inYear: boolean }[] = [];
        for (let d = 0; d < 7; d++) {
            const ds = cur.toISOString().split('T')[0];
            const inYear = cur >= startDate && cur <= endDate;
            week.push({ date: ds, count: activity[ds] || 0, inYear });
            cur.setDate(cur.getDate() + 1);
        }
        weeks.push(week);
    }

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthLabels: { label: string; col: number }[] = [];
    weeks.forEach((week, wi) => {
        week.forEach(cell => {
            if (!cell.inYear) return;
            const d = new Date(cell.date + 'T00:00:00');
            if (d.getDate() === 1) {
                const last = monthLabels[monthLabels.length - 1];
                if (!last || wi - last.col >= 3) monthLabels.push({ label: MONTHS[d.getMonth()], col: wi });
            }
        });
    });

    const getColor = (count: number, inYear: boolean) => {
        if (!inYear) return 'transparent';
        if (count === 0) return 'rgba(255,255,255,0.06)';
        if (count === 1) return 'rgba(255,107,53,0.25)';
        if (count === 2) return 'rgba(255,107,53,0.45)';
        if (count <= 4) return 'rgba(255,107,53,0.70)';
        return '#ff6b35';
    };

    return (
        <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
            {/* Month row */}
            <div style={{ position: 'relative', height: '16px', marginLeft: '34px', marginBottom: '4px' }}>
                {monthLabels.map(({ label, col }) => (
                    <span key={label} style={{ position: 'absolute', left: col * STEP, fontSize: '10px', fontWeight: '700', color: '#4a5e4a', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                        {label}
                    </span>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 0 }}>
                {/* Day labels */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, marginRight: '4px', width: '30px', flexShrink: 0 }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((l, i) => (
                        <div key={i} style={{ height: CELL, fontSize: '8px', color: '#4a5e4a', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '4px' }}>
                            {l}
                        </div>
                    ))}
                </div>
                {/* Week columns */}
                <div style={{ display: 'flex', gap: GAP }}>
                    {weeks.map((week, wi) => (
                        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                            {week.map((cell, di) => (
                                <div key={di} title={cell.inYear ? `${cell.date}: ${cell.count} quiz${cell.count !== 1 ? 'zes' : ''}` : ''}
                                    style={{ width: CELL, height: CELL, borderRadius: '2px', backgroundColor: getColor(cell.count, cell.inYear), flexShrink: 0 }} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '10px', color: '#4a5e4a', fontWeight: '700', textTransform: 'uppercase' }}>Less</span>
                {[0, 1, 2, 3, 5].map((v, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: '2px', backgroundColor: getColor(v, true) }} />
                ))}
                <span style={{ fontSize: '10px', color: '#4a5e4a', fontWeight: '700', textTransform: 'uppercase' }}>More</span>
            </div>
        </div>
    );
}

// ===== Sidebar =====
function Sidebar({ username, level, xpToNext }: { username: string; level: number; xpToNext: number }) {
    const navItems = [
        { href: '/', icon: '⊞', label: 'Dashboard', active: false },
        { href: '/', icon: '🎬', label: 'Shows', active: false },
        { href: '/leaderboard', icon: '🏆', label: 'Leaderboard', active: false },
        { href: '/forum', icon: '💬', label: 'Discussions', active: false },
        { href: '#', icon: '👤', label: 'Profile', active: true },
    ];

    return (
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
                    {/* XP bar */}
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
    );
}

// ===== Main component =====
export default function ProfilePage() {
    const params = useParams();
    const userId = params.userId as string;
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState<any>(null);
    const [activityData, setActivityData] = useState<ActivityData | null>(null);
    const [shows, setShows] = useState<Show[]>([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear().toString());

    // Social follow state
    const [isFollowing, setIsFollowing] = useState(false);
    const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
    const [socialModal, setSocialModal] = useState<null | 'followers' | 'following'>(null);
    const [socialList, setSocialList] = useState<any[]>([]);
    const [followLoading, setFollowLoading] = useState(false);

    // User search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);


    const isOwn = currentUser?.id === userId;
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        Promise.all([
            usersApi.getStats(userId),
            activityApi.get(userId, year),
            showsApi.getAll(),
        ])
            .then(([profileRes, actRes, showsRes]) => {
                setProfile(profileRes.data);
                setActivityData(actRes.data);
                setShows(showsRes.data);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [userId, year, isOwn]);

    // Load follow counts and follow status
    useEffect(() => {
        socialApi.getCounts(userId).then(r => setFollowCounts(r.data)).catch(() => { });
        if (currentUser && !isOwn) {
            socialApi.isFollowing(userId).then(r => setIsFollowing(r.data)).catch(() => { });
        }
    }, [userId, currentUser, isOwn]);

    const handleFollowToggle = async () => {
        if (!currentUser) return;
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await socialApi.unfollow(userId);
                setIsFollowing(false);
                setFollowCounts(c => ({ ...c, followers: Math.max(0, c.followers - 1) }));
            } else {
                await socialApi.follow(userId);
                setIsFollowing(true);
                setFollowCounts(c => ({ ...c, followers: c.followers + 1 }));
            }
        } catch { }
        setFollowLoading(false);
    };

    const openSocialModal = async (type: 'followers' | 'following') => {
        setSocialModal(type);
        setSocialList([]);
        try {
            const res = type === 'followers'
                ? await socialApi.getFollowers(userId)
                : await socialApi.getFollowing(userId);
            setSocialList(res.data);
        } catch { }
    };

    const recommendedShow = useMemo(() => shows.find(s => s.seasons && s.seasons.length > 0) || shows[0], [shows]);

    if (loading) return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <div style={{ width: '256px', background: '#0f1a0f', flexShrink: 0 }} />
            <div style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="skeleton" style={{ height: '60px', borderRadius: '12px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '12px' }} />)}
                </div>
                <div className="skeleton" style={{ height: '220px', borderRadius: '12px' }} />
            </div>
        </div>
    );

    if (!profile) return <div style={{ textAlign: 'center', padding: '80px', color: '#4a5e4a' }}>User not found</div>;

    const totalScore = profile.totalScore || 0;
    const quizzesAttempted = profile.quizzesAttempted || 0;
    const streak = activityData?.streak ?? 0;
    const level = Math.max(1, Math.floor(totalScore / 1000));
    const accuracy = profile.recentAttempts && profile.recentAttempts.length > 0
        ? Math.round(profile.recentAttempts.reduce((acc: number, cur: any) => acc + cur.percentage, 0) / profile.recentAttempts.length)
        : 0;

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0f1a0f' }}>
            <Sidebar username={profile.username} level={level} xpToNext={2450} />

            {/* Main content */}
            <main style={{ flex: 1, overflowY: 'auto', position: 'relative', background: '#0f1a0f' }}>

                {/* ===== STICKY TOP BAR ===== */}
                <header style={{
                    position: 'sticky', top: 0, zIndex: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 32px',
                    background: 'rgba(255,107,53,0.03)', backdropFilter: 'blur(16px)',
                    borderBottom: '1px solid rgba(255,107,53,0.08)',
                }}>
                    {/* Search */}
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4a5e4a', fontSize: '16px' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search users by username..."
                            value={searchQuery}
                            onChange={(e) => {
                                const v = e.target.value;
                                setSearchQuery(v);
                                if (searchTimeout) clearTimeout(searchTimeout);
                                if (v.trim().length === 0) { setSearchResults([]); return; }
                                const t = setTimeout(async () => {
                                    try { const r = await usersApi.search(v); setSearchResults(r.data); } catch { setSearchResults([]); }
                                }, 300);
                                setSearchTimeout(t);
                            }}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => { setTimeout(() => setSearchFocused(false), 200); }}
                            style={{
                                width: '100%', padding: '10px 16px 10px 38px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,107,53,0.1)',
                                borderRadius: '12px', color: 'var(--text-primary)',
                                fontSize: '13px', outline: 'none',
                                fontFamily: 'inherit',
                            }}
                        />
                        {/* Search results dropdown */}
                        {searchFocused && searchQuery.trim().length > 0 && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                                background: '#162418', border: '1px solid rgba(255,107,53,0.2)',
                                borderRadius: '12px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                                zIndex: 50, maxHeight: '280px', overflowY: 'auto',
                            }}>
                                {searchResults.length === 0 ? (
                                    <p style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No users found</p>
                                ) : searchResults.map((u: any) => (
                                    <Link
                                        key={u.id}
                                        href={`/profile/${u.id}`}
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,107,53,0.08)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#ff6b35,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px', color: 'white', flexShrink: 0 }}>
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
                    {/* Right controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {streak > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '10px', background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)' }}>
                                <span style={{ fontSize: '15px' }}>🔥</span>
                                <span style={{ color: '#ff6b35', fontWeight: '800', fontSize: '13px' }}>{streak} Days</span>
                            </div>
                        )}
                        {/* Follow counts */}
                        <button
                            onClick={() => openSocialModal('followers')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'block', fontWeight: '900', fontSize: '15px', color: 'white' }}>{followCounts.followers}</span>
                            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Followers</span>
                        </button>
                        <button
                            onClick={() => openSocialModal('following')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'block', fontWeight: '900', fontSize: '15px', color: 'white' }}>{followCounts.following}</span>
                            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Following</span>
                        </button>
                        {/* Follow/Unfollow button — only show on other users' profiles */}
                        {!isOwn && currentUser && (
                            <button
                                onClick={handleFollowToggle}
                                disabled={followLoading}
                                style={{
                                    padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                    fontWeight: '800', fontSize: '13px', transition: 'all 0.2s',
                                    background: isFollowing ? 'rgba(255,255,255,0.08)' : '#ff6b35',
                                    color: isFollowing ? 'var(--text-secondary)' : '#0f1a0f',
                                    opacity: followLoading ? 0.6 : 1,
                                }}>
                                {followLoading ? '...' : isFollowing ? 'Following ✓' : '+ Follow'}
                            </button>
                        )}
                        <div style={{ width: '1px', height: '36px', background: 'rgba(255,107,53,0.1)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>{profile.username}</p>
                                <p style={{ fontSize: '10px', color: '#ff6b35', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                    {profile.role === 'admin' ? 'Admin' : 'Gold Tier'}
                                </p>
                            </div>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #ff6b35, #8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '18px', fontWeight: '900', color: 'white',
                                border: '2px solid #ff6b35', boxShadow: '0 0 12px rgba(255,107,53,0.3)',
                                flexShrink: 0,
                            }}>
                                {profile.username.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* ===== SOCIAL MODAL ===== */}
                {socialModal && (
                    <div
                        onClick={() => setSocialModal(null)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{ background: '#162418', border: '1px solid rgba(255,107,53,0.2)', borderRadius: '16px', padding: '28px', width: '360px', maxHeight: '70vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontWeight: '900', fontSize: '16px', color: 'white', textTransform: 'capitalize' }}>{socialModal}</h3>
                                <button onClick={() => setSocialModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}>✕</button>
                            </div>
                            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {socialList.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>No users yet</p>
                                ) : socialList.map((u: any) => (
                                    <Link
                                        key={u.id}
                                        href={`/profile/${u.id}`}
                                        onClick={() => setSocialModal(null)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', transition: 'border-color 0.2s' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.3)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                                    >
                                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#ff6b35,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '15px', color: 'white', flexShrink: 0 }}>
                                            {u.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: '700', fontSize: '14px', color: 'white' }}>{u.username}</p>
                                            <p style={{ fontSize: '12px', color: '#ff6b35', fontWeight: '600' }}>{u.totalScore?.toLocaleString() || 0} XP</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== CONTENT ===== */}
                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* ===== 3 STAT CARDS ===== */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {[
                            { icon: '🏅', label: 'Total Score', value: totalScore.toLocaleString(), badge: '+12%', badgeColor: '#ff6b35' },
                            { icon: '🌐', label: 'Global Rank', value: `#${Math.max(1, 5000 - totalScore).toLocaleString()}`, badge: 'Top 5%', badgeColor: '#ff6b35' },
                            { icon: '🎯', label: 'Accuracy', value: `${accuracy}%`, badge: `Avg: ${accuracy}%`, badgeColor: '#4a5e4a' },
                        ].map(stat => (
                            <div key={stat.label} style={{
                                background: 'rgba(255,107,53,0.03)',
                                border: '1px solid rgba(255,107,53,0.1)',
                                borderRadius: '14px', padding: '24px',
                                transition: 'border-color 0.2s',
                            }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,107,53,0.3)'; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,107,53,0.1)'; }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <span style={{ fontSize: '22px', padding: '8px', background: 'rgba(255,107,53,0.1)', borderRadius: '8px' }}>{stat.icon}</span>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: stat.badgeColor, background: stat.badgeColor === '#ff6b35' ? 'rgba(255,107,53,0.1)' : 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '6px' }}>
                                        {stat.badge}
                                    </span>
                                </div>
                                <p style={{ fontSize: '13px', color: '#4a5e4a', fontWeight: '600', marginBottom: '4px' }}>{stat.label}</p>
                                <h3 style={{ fontSize: '30px', fontWeight: '900', letterSpacing: '-1px', color: 'var(--text-primary)' }}>{stat.value}</h3>
                            </div>
                        ))}
                    </div>

                    {/* ===== HEATMAP + RECOMMENDED ===== */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '24px' }}>

                        {/* Heatmap */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#ff6b35' }}>📅</span> Binge Activity
                                </h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: '#4a5e4a', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    <span>Less</span>
                                    {[0, 1, 2, 3, 5].map((v, i) => (
                                        <div key={i} style={{ width: 12, height: 12, borderRadius: '2px', background: v === 0 ? 'rgba(255,255,255,0.06)' : `rgba(255,107,53,${[0.25, 0.45, 0.70, 1][Math.min(i - 1, 3)]})` }} />
                                    ))}
                                    <span>More</span>
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255,107,53,0.03)', border: '1px solid rgba(255,107,53,0.1)', borderRadius: '14px', padding: '24px', overflowX: 'auto' }}>
                                {activityData ? (
                                    <ActivityHeatmap activity={activityData.activity} year={year} />
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#4a5e4a', padding: '32px' }}>No activity data yet</div>
                                )}
                                {/* Month labels + year switcher */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {[currentYear - 1, currentYear].map(y => (
                                            <button key={y} onClick={() => setYear(y.toString())} style={{
                                                padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                                                border: '1px solid rgba(255,107,53,0.2)',
                                                background: year === y.toString() ? '#ff6b35' : 'transparent',
                                                color: year === y.toString() ? '#0f1a0f' : '#4a5e4a',
                                                cursor: 'pointer', transition: 'all 0.2s',
                                            }}>
                                                {y}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recommended show card */}
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#ff6b35' }}>✨</span> Recommended
                            </h2>
                            {recommendedShow ? (
                                <Link href={`/shows/${recommendedShow.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                                    <div style={{
                                        position: 'relative', aspectRatio: '3/4', borderRadius: '16px', overflow: 'hidden',
                                        border: '1px solid rgba(255,107,53,0.2)', boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                                        transition: 'transform 0.25s',
                                    }}
                                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'; }}
                                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}>
                                        {(recommendedShow as any).posterUrl ? (
                                            <img src={(recommendedShow as any).posterUrl} alt={recommendedShow.name}
                                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,107,53,0.4), rgba(139,92,246,0.4))' }} />
                                        )}
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0f1a0f 0%, transparent 50%)' }} />
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 16px' }}>
                                            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                                                <span style={{ padding: '2px 7px', borderRadius: '4px', fontSize: '9px', fontWeight: '900', background: '#ff6b35', color: '#0f1a0f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Quiz</span>
                                            </div>
                                            <h3 style={{ fontWeight: '900', color: 'white', fontSize: '15px', lineHeight: 1.25, textTransform: 'uppercase', letterSpacing: '-0.3px', marginBottom: '10px' }}>
                                                {recommendedShow.name}
                                            </h3>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <div style={{ flex: 1, padding: '8px', borderRadius: '8px', background: '#ff6b35', color: '#0f1a0f', fontWeight: '900', fontSize: '12px', textAlign: 'center' }}>
                                                    ▶ Play Now
                                                </div>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px' }}>
                                                    +
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <div style={{ aspectRatio: '3/4', borderRadius: '16px', background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a5e4a', fontSize: '14px' }}>
                                    No shows yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ===== RECENT MISSIONS ===== */}
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#ff6b35' }}>🕐</span> Recent Missions
                        </h2>
                        <div style={{ background: 'rgba(255,107,53,0.03)', border: '1px solid rgba(255,107,53,0.1)', borderRadius: '14px', overflow: 'hidden' }}>
                            {profile.recentAttempts && profile.recentAttempts.length > 0 ? (
                                <div>
                                    {profile.recentAttempts.map((attempt: Attempt, i: number) => (
                                        <Link key={attempt.id} href={`/results/${attempt.id}`}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '16px 20px', textDecoration: 'none',
                                                borderBottom: i < profile.recentAttempts.length - 1 ? '1px solid rgba(255,107,53,0.06)' : 'none',
                                                transition: 'background 0.2s',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,107,53,0.05)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,107,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                                                    🎬
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '2px' }}>
                                                        Quiz — {attempt.score}/{attempt.total} correct
                                                    </p>
                                                    <p style={{ fontSize: '12px', color: '#4a5e4a' }}>
                                                        {new Date(attempt.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ color: '#ff6b35', fontWeight: '900', fontSize: '14px', marginBottom: '2px' }}>+{attempt.score * 10} XP</p>
                                                <p style={{ fontSize: '10px', color: '#4a5e4a', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{attempt.percentage}% accuracy</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#4a5e4a' }}>
                                    <p style={{ fontSize: '15px', marginBottom: '6px' }}>No missions completed yet</p>
                                    <Link href="/" style={{ color: '#ff6b35', fontWeight: '700', textDecoration: 'none', fontSize: '13px' }}>Browse Shows →</Link>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
