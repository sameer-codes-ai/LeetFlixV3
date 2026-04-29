'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { showsApi, quizApi } from '@/lib/api';
import { Show } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { BookOpen, ChevronDown, ChevronRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface LearnSeason {
    seasonId: string;
    seasonName: string;
    order: number;
    questions: {
        id: string;
        question: string;
        options: string[];
        answer: string;
    }[];
}

export default function LearnPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const { user } = useAuth();

    const [show, setShow] = useState<Show | null>(null);
    const [seasons, setSeasons] = useState<LearnSeason[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSeasons, setExpandedSeasons] = useState<Record<string, boolean>>({});
    const [hideAnswers, setHideAnswers] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!user) { router.push('/login'); return; }

        showsApi.getBySlug(slug)
            .then(async (res) => {
                const showData = res.data;
                setShow(showData);
                // Expand first season by default
                try {
                    const learnRes = await quizApi.getLearnData(showData.id);
                    setSeasons(learnRes.data);
                    if (learnRes.data.length > 0) {
                        setExpandedSeasons({ [learnRes.data[0].seasonId]: true });
                    }
                } catch { }
            })
            .catch(() => router.push('/'))
            .finally(() => setLoading(false));
    }, [slug, user]);

    const toggleSeason = (seasonId: string) => {
        setExpandedSeasons(prev => ({ ...prev, [seasonId]: !prev[seasonId] }));
    };

    const toggleAllAnswers = (seasonId: string, questions: LearnSeason['questions']) => {
        const allHidden = questions.every(q => hideAnswers[q.id]);
        const updates: Record<string, boolean> = {};
        questions.forEach(q => { updates[q.id] = !allHidden; });
        setHideAnswers(prev => ({ ...prev, ...updates }));
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#4a5e4a' }}>Loading study material…</p>
        </div>
    );

    if (!show) return null;

    const totalQuestions = seasons.reduce((sum, s) => sum + s.questions.length, 0);

    return (
        <div style={{ minHeight: '100vh', background: '#0f1a0f' }}>
            {/* Header */}
            <header className="learn-header" style={{
                position: 'sticky', top: 0, zIndex: 30,
                background: 'rgba(15,26,15,0.95)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255,107,53,0.1)',
                padding: '16px 24px',
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Link href={`/shows/${slug}`} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 14px', borderRadius: '8px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600',
                            textDecoration: 'none', transition: 'all 0.2s',
                        }}>
                            <ArrowLeft size={14} /> Back
                        </Link>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BookOpen size={18} color="#ff6b35" />
                                <h1 style={{ fontSize: '18px', fontWeight: '800', color: 'white', letterSpacing: '-0.3px' }}>
                                    {show.name} — Learn Mode
                                </h1>
                            </div>
                            <p style={{ fontSize: '12px', color: '#4a5e4a', marginTop: '2px' }}>
                                {seasons.length} Week{seasons.length !== 1 ? 's' : ''} · {totalQuestions} Question{totalQuestions !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

                {seasons.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 24px', color: '#4a5e4a' }}>
                        No study material available yet.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {seasons.map((season) => {
                            const isExpanded = expandedSeasons[season.seasonId];
                            const allHidden = season.questions.length > 0 && season.questions.every(q => hideAnswers[q.id]);

                            return (
                                <div key={season.seasonId} style={{
                                    background: 'rgba(255,107,53,0.03)',
                                    border: '1px solid rgba(255,107,53,0.1)',
                                    borderRadius: '14px', overflow: 'hidden',
                                    transition: 'border-color 0.2s',
                                }}>
                                    {/* Season header */}
                                    <button
                                        onClick={() => toggleSeason(season.seasonId)}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'white', textAlign: 'left',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '10px',
                                                background: isExpanded ? '#ff6b35' : 'rgba(255,107,53,0.15)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: isExpanded ? '#0f1a0f' : '#ff6b35',
                                                fontSize: '14px', fontWeight: '900', transition: 'all 0.25s',
                                            }}>
                                                {season.order || parseInt(season.seasonName.replace(/\D/g, '')) || '?'}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '16px', fontWeight: '700' }}>{season.seasonName}</p>
                                                <p style={{ fontSize: '12px', color: '#4a5e4a', marginTop: '2px' }}>
                                                    {season.questions.length} question{season.questions.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        {isExpanded ? <ChevronDown size={20} color="#ff6b35" /> : <ChevronRight size={20} color="#4a5e4a" />}
                                    </button>

                                    {/* Questions */}
                                    {isExpanded && (
                                        <div style={{ borderTop: '1px solid rgba(255,107,53,0.08)' }}>
                                            {/* Toggle all answers */}
                                            {season.questions.length > 0 && (
                                                <div style={{ padding: '12px 24px', display: 'flex', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => toggleAllAnswers(season.seasonId, season.questions)}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '6px',
                                                            padding: '6px 14px', borderRadius: '8px',
                                                            background: allHidden ? 'rgba(255,255,255,0.05)' : 'rgba(255,107,53,0.15)',
                                                            border: '1px solid rgba(255,107,53,0.2)',
                                                            color: allHidden ? '#94a394' : '#ff6b35',
                                                            fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                        }}
                                                    >
                                                        {allHidden ? <Eye size={13} /> : <EyeOff size={13} />}
                                                        {allHidden ? 'Show All Answers' : 'Hide All Answers'}
                                                    </button>
                                                </div>
                                            )}

                                            {season.questions.map((q, qi) => (
                                                <div key={q.id} style={{
                                                    padding: '20px 24px',
                                                    borderTop: qi === 0 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                                                }}>
                                                    {/* Question */}
                                                    <div style={{ display: 'flex', gap: '14px', marginBottom: '12px' }}>
                                                        <span style={{
                                                            width: '28px', height: '28px', borderRadius: '6px',
                                                            background: 'rgba(255,107,53,0.12)', color: '#ff6b35',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '12px', fontWeight: '900', flexShrink: 0,
                                                        }}>
                                                            {qi + 1}
                                                        </span>
                                                        <p style={{ fontSize: '15px', fontWeight: '600', color: 'white', lineHeight: 1.6, flex: 1 }}>
                                                            {q.question}
                                                        </p>
                                                    </div>

                                                    {/* Options */}
                                                    <div className="learn-options" style={{ marginLeft: '42px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                        {q.options.map((opt, oi) => {
                                                            const isAnswer = opt === q.answer;
                                                            const hidden = hideAnswers[q.id];
                                                            const showMark = !hidden && isAnswer;
                                                            return (
                                                                <div key={oi} style={{
                                                                    padding: '10px 14px', borderRadius: '8px',
                                                                    border: `1px solid ${showMark ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.06)'}`,
                                                                    background: showMark ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)',
                                                                    display: 'flex', alignItems: 'center', gap: '10px',
                                                                    transition: 'all 0.25s',
                                                                }}>
                                                                    <span style={{
                                                                        fontSize: '11px', fontWeight: '800',
                                                                        color: showMark ? '#10b981' : '#4a5e4a',
                                                                        minWidth: '16px',
                                                                    }}>
                                                                        {String.fromCharCode(65 + oi)}.
                                                                    </span>
                                                                    <span style={{
                                                                        fontSize: '14px',
                                                                        color: showMark ? '#10b981' : 'var(--text-secondary)',
                                                                        fontWeight: showMark ? '700' : '400',
                                                                    }}>
                                                                        {opt}
                                                                    </span>
                                                                    {showMark && (
                                                                        <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                                            ✓ Answer
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>


                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
