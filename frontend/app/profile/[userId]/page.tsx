'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usersApi, activityApi } from '@/lib/api';
import { ActivityData, Attempt } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { Flame, Trophy, BookOpen, Calendar, ChevronRight } from 'lucide-react';

// Correct GitHub-style heatmap:
// 1. Builds a full week-column grid
// 2. Places month labels at the exact column where each month starts
function ActivityHeatmap({ activity, year }: { activity: Record<string, number>; year: string }) {
    const CELL = 13; // px
    const GAP = 3;   // px
    const STEP = CELL + GAP;
    const DAY_LABEL_W = 30; // px reserved for weekday labels (3 chars)

    const startDate = new Date(`${year}-01-01T00:00:00`);
    const endDate = new Date(`${year}-12-31T00:00:00`);

    // Align grid start to Sunday before Jan 1
    const gridStart = new Date(startDate);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());

    // Build week columns
    const weeks: { date: string; count: number; inYear: boolean }[][] = [];
    let cur = new Date(gridStart);

    while (cur <= endDate) {
        const week: { date: string; count: number; inYear: boolean }[] = [];
        for (let d = 0; d < 7; d++) {
            const dateStr = cur.toISOString().split('T')[0];
            const inYear = cur >= startDate && cur <= endDate;
            week.push({ date: dateStr, count: activity[dateStr] || 0, inYear });
            cur.setDate(cur.getDate() + 1);
        }
        weeks.push(week);
    }

    // Calculate which week column each month starts at
    const monthLabels: { label: string; col: number }[] = [];
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    weeks.forEach((week, wi) => {
        week.forEach((cell, di) => {
            if (!cell.inYear) return;
            const d = new Date(cell.date + 'T00:00:00');
            if (d.getDate() === 1) {
                // Only add if not too close to previous label
                const last = monthLabels[monthLabels.length - 1];
                if (!last || wi - last.col >= 3) {
                    monthLabels.push({ label: MONTHS[d.getMonth()], col: wi });
                }
            }
        });
    });

    const getColor = (count: number, inYear: boolean) => {
        if (!inYear) return 'transparent';
        if (count === 0) return 'rgba(255,255,255,0.06)';
        if (count === 1) return 'rgba(99,102,241,0.35)';
        if (count === 2) return 'rgba(99,102,241,0.55)';
        if (count <= 4) return 'rgba(99,102,241,0.78)';
        return '#6366f1';
    };

    const gridWidth = weeks.length * STEP - GAP;

    return (
        <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
            {/* Month labels — absolutely positioned over the correct column */}
            <div style={{ position: 'relative', height: '18px', marginLeft: DAY_LABEL_W + 4 }}>
                {monthLabels.map(({ label, col }) => (
                    <span
                        key={label}
                        style={{
                            position: 'absolute',
                            left: col * STEP,
                            fontSize: '10px',
                            fontWeight: '600',
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {label}
                    </span>
                ))}
            </div>

            {/* Grid */}
            <div style={{ display: 'flex', gap: '0' }}>
                {/* Weekday labels: all 7 days */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: GAP,
                        marginRight: '4px',
                        width: DAY_LABEL_W,
                        flexShrink: 0,
                    }}
                >
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label, i) => (
                        <div
                            key={i}
                            style={{
                                height: CELL,
                                fontSize: '9px',
                                color: 'var(--text-muted)',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                paddingRight: '4px',
                            }}
                        >
                            {label}
                        </div>
                    ))}
                </div>

                {/* Week columns */}
                <div style={{ display: 'flex', gap: GAP }}>
                    {weeks.map((week, wi) => (
                        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                            {week.map((cell, di) => (
                                <div
                                    key={di}
                                    title={cell.inYear ? `${cell.date}: ${cell.count} quiz${cell.count !== 1 ? 'zes' : ''}` : ''}
                                    style={{
                                        width: CELL,
                                        height: CELL,
                                        borderRadius: '2px',
                                        backgroundColor: getColor(cell.count, cell.inYear),
                                        transition: 'background-color 0.2s',
                                        flexShrink: 0,
                                        cursor: cell.inYear && cell.count > 0 ? 'default' : 'default',
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '10px',
                    justifyContent: 'flex-end',
                }}
            >
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Less</span>
                {[false, 1, 2, 3, 5].map((v, i) => (
                    <div
                        key={i}
                        style={{
                            width: 11, height: 11, borderRadius: '2px',
                            backgroundColor: v === false
                                ? 'rgba(255,255,255,0.06)'
                                : getColor(v as number, true),
                        }}
                    />
                ))}
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>More</span>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const params = useParams();
    const userId = params.userId as string;
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState<any>(null);
    const [activityData, setActivityData] = useState<ActivityData | null>(null);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear().toString());

    const isOwn = currentUser?.id === userId;

    useEffect(() => {
        Promise.all([
            isOwn ? usersApi.getMe() : usersApi.getProfile(userId),
            activityApi.get(userId, year),
        ])
            .then(([profileRes, actRes]) => {
                setProfile(profileRes.data);
                setActivityData(actRes.data);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [userId, year, isOwn]);

    if (loading) {
        return (
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
                <div className="skeleton" style={{ height: '220px', borderRadius: '16px', marginBottom: '24px' }} />
                <div className="skeleton" style={{ height: '160px', borderRadius: '16px' }} />
            </div>
        );
    }

    if (!profile) return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>User not found</div>;

    const currentYear = new Date().getFullYear();

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
            {/* Profile header */}
            <div
                className="glass"
                style={{
                    padding: '32px',
                    marginBottom: '24px',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(34,211,238,0.04))',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <div
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, hsl(${userId.charCodeAt(0) * 10}, 65%, 45%), hsl(${userId.charCodeAt(1) * 10}, 65%, 55%))`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            fontWeight: '800',
                            color: 'white',
                            flexShrink: 0,
                            boxShadow: '0 0 20px rgba(99,102,241,0.3)',
                        }}
                    >
                        {profile.username.charAt(0).toUpperCase()}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <h1 style={{ fontSize: '26px', fontWeight: '900' }}>{profile.username}</h1>
                            {profile.role === 'admin' && (
                                <span className="badge badge-yellow" style={{ fontSize: '11px' }}>👑 Admin</span>
                            )}
                            {isOwn && (
                                <span className="badge badge-accent" style={{ fontSize: '11px' }}>You</span>
                            )}
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '16px',
                        marginTop: '28px',
                    }}
                >
                    {[
                        { icon: <Trophy size={18} color="var(--accent-yellow)" />, label: 'Total Score', value: (profile.totalScore || 0).toLocaleString() },
                        { icon: <BookOpen size={18} color="var(--accent-cyan)" />, label: 'Quizzes Done', value: profile.quizzesAttempted || 0 },
                        { icon: <Flame size={18} color="var(--accent-red)" />, label: 'Current Streak', value: `${activityData?.streak ?? 0}d` },
                        { icon: <Calendar size={18} color="var(--accent-green)" />, label: 'Active Days', value: activityData?.totalDays ?? 0 },
                    ].map((stat) => (
                        <div key={stat.label} className="stat-card" style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>{stat.icon}</div>
                            <p style={{ fontSize: '24px', fontWeight: '900', marginBottom: '2px' }}>{stat.value}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Activity heatmap */}
            <div className="glass" style={{ padding: '28px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={18} color="var(--accent-green)" />
                        Activity
                    </h2>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {[currentYear - 1, currentYear].map((y) => (
                            <button
                                key={y}
                                onClick={() => setYear(y.toString())}
                                style={{
                                    padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700',
                                    border: '1px solid var(--border)',
                                    background: year === y.toString() ? 'var(--accent)' : 'transparent',
                                    color: year === y.toString() ? 'white' : 'var(--text-secondary)',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                            >
                                {y}
                            </button>
                        ))}
                    </div>
                </div>

                {activityData ? (
                    <ActivityHeatmap activity={activityData.activity} year={year} />
                ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                        No activity data yet
                    </div>
                )}
            </div>

            {/* Recent attempts */}
            {isOwn && profile.recentAttempts && profile.recentAttempts.length > 0 && (
                <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BookOpen size={18} color="var(--accent-cyan)" />
                            Recent Attempts
                        </h2>
                    </div>
                    {profile.recentAttempts.map((attempt: Attempt, i: number) => (
                        <Link
                            key={attempt.id}
                            href={`/results/${attempt.id}`}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '16px 24px',
                                borderBottom: i < profile.recentAttempts.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                textDecoration: 'none', transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
                                    {attempt.score}/{attempt.total} correct
                                </p>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    {new Date(attempt.completedAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className={`badge ${attempt.percentage >= 80 ? 'badge-green' : attempt.percentage >= 50 ? 'badge-yellow' : 'badge-red'}`}>
                                    {attempt.percentage}%
                                </span>
                                <ChevronRight size={16} color="var(--text-muted)" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
