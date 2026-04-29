'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { quizApi } from '@/lib/api';
import { Question } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle, XCircle, Flag } from 'lucide-react';

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const TIMER_DURATION = 45;
const AUTO_ADVANCE_DELAY = 1500;

// ─── Inner component uses useSearchParams ──────────────────────────────────────
function QuizContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const seasonId = params.seasonId as string;
    const showId = searchParams.get('showId') || '';
    const { user } = useAuth();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
    const [timerActive, setTimerActive] = useState(false);
    const [justSelected, setJustSelected] = useState<string | null>(null);
    const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const totalTime = useRef(0); // accumulates time spent
    const fetchedRef = useRef(false); // prevent double-fetch on auth update
    const isCombined = seasonId === 'all';

    // Auth guard — redirect to login if not authenticated
    useEffect(() => {
        if (!user) router.push('/login');
    }, [user, router]);

    // Fetch questions ONCE (not on auth changes)
    useEffect(() => {
        if (!user || fetchedRef.current) return;
        fetchedRef.current = true;
        const fetchPromise = isCombined
            ? quizApi.getAllShowQuestions(showId)
            : quizApi.getQuestions(seasonId);
        fetchPromise
            .then(res => { setQuestions(res.data); setTimerActive(true); })
            .catch(() => router.push('/'))
            .finally(() => setLoading(false));
    }, [seasonId, showId, user, isCombined, router]);

    useEffect(() => {
        if (!timerActive || loading || justSelected) return;
        if (timeLeft <= 0) { advanceQuestion(); return; }
        const t = setTimeout(() => { setTimeLeft(p => p - 1); totalTime.current++; }, 1000);
        return () => clearTimeout(t);
    }, [timeLeft, timerActive, loading, justSelected]);

    const advanceQuestion = useCallback(() => {
        setJustSelected(null);
        if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
        setCurrent(prev => {
            if (prev + 1 < questions.length) { setTimeLeft(TIMER_DURATION); return prev + 1; }
            return prev;
        });
    }, [questions.length]);

    const submitQuiz = useCallback(async (finalAnswers: Record<string, string>) => {
        setTimerActive(false);
        setSubmitting(true);
        const payload = questions.map(q => ({ questionId: q.id, selected: finalAnswers[q.id] || '' }));
        try {
            const res = await quizApi.submitAttempt({ seasonId, showId, answers: payload });
            router.push(`/results/${res.data.attemptId}`);
        } catch { setSubmitting(false); setTimerActive(true); }
    }, [questions, seasonId, showId, router]);

    const handleSelect = (questionId: string, option: string) => {
        if (justSelected) return;
        const newAnswers = { ...answers, [questionId]: option };
        setAnswers(newAnswers);
        setJustSelected(option);
        const isLast = current === questions.length - 1;
        autoAdvanceRef.current = setTimeout(() => {
            if (isLast) submitQuiz(newAnswers);
            else advanceQuestion();
        }, AUTO_ADVANCE_DELAY);
    };

    useEffect(() => () => { if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current); }, []);

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#4a5e4a' }}>Loading questions…</p>
        </div>
    );

    if (questions.length === 0) return (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: '#4a5e4a' }}>No questions available.</div>
    );

    if (submitting) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
            <CheckCircle size={52} color="#ff6b35" />
            <p style={{ fontSize: '18px', fontWeight: '800' }}>Submitting…</p>
        </div>
    );

    const q = questions[current];
    const isLast = current === questions.length - 1;
    const progress = ((current + 1) / questions.length) * 100;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const avgTime = current > 0 ? Math.round(totalTime.current / current) : 0;

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', background: '#0f1a0f',
        }}>
            {/* ===== HEADER ===== */}
            <header style={{
                width: '100%', maxWidth: '900px', padding: '16px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px', color: '#ff6b35' }}>⚡</span>
                    <span style={{ fontWeight: '800', fontSize: '18px', letterSpacing: '-0.3px' }}>LeetFlix</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Timer pill */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 18px', borderRadius: '999px',
                        background: timeLeft <= 8 ? 'rgba(244,63,94,0.15)' : 'rgba(255,107,53,0.12)',
                        border: `1px solid ${timeLeft <= 8 ? 'rgba(244,63,94,0.4)' : 'rgba(255,107,53,0.3)'}`,
                        color: timeLeft <= 8 ? '#f87171' : '#ff6b35',
                        fontWeight: '900', fontSize: '15px', fontFamily: 'monospace',
                    }}>
                        <span style={{ fontSize: '14px' }}>⏱</span>
                        {timerStr}
                    </div>
                    <button style={{
                        width: '38px', height: '38px', borderRadius: '8px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#94a394', cursor: 'pointer', fontSize: '18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        ⚙
                    </button>
                </div>
            </header>

            {/* ===== MAIN CONTENT ===== */}
            <main style={{ flex: 1, width: '100%', maxWidth: '680px', padding: '24px 24px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {/* Progress section */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                        <div>
                            <p style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '2px', color: '#ff6b35', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Current Stage
                            </p>
                            <p style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                Question {current + 1} of {questions.length}
                            </p>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#94a394' }}>{Math.round(progress)}% Complete</span>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: '6px', background: 'rgba(255,107,53,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: '#ff6b35', borderRadius: '999px', transition: 'width 0.4s ease' }} />
                    </div>
                </div>

                {/* Question card */}
                <div style={{
                    background: 'rgba(255,107,53,0.03)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,107,53,0.1)',
                    borderRadius: '16px', padding: '40px 48px',
                    position: 'relative', overflow: 'hidden', boxShadow: '2px 24px 60px rgba(0,0,0,0.3)',
                }}>
                    {/* Ambient glow */}
                    <div style={{ position: 'absolute', top: '-64px', right: '-64px', width: '200px', height: '200px', background: 'rgba(255,107,53,0.05)', borderRadius: '50%', filter: 'blur(40px)' }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        {/* Category */}
                        <p style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,107,53,0.6)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px' }}>
                            Question
                        </p>
                        {/* Question */}
                        <h2 style={{ fontSize: 'clamp(20px,3vw,26px)', fontWeight: '800', lineHeight: 1.5, marginBottom: '32px', color: 'white' }}>
                            {q.question}
                        </h2>

                        {/* Options */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {q.options.map((option: string, i: number) => {
                                const isSelected = answers[q.id] === option;
                                const isCorrectAnswer = q.answer === option;
                                const showFeedback = !!justSelected;
                                const isWrongPick = showFeedback && isSelected && !isCorrectAnswer;
                                const isCorrectReveal = showFeedback && isCorrectAnswer;

                                // Determine border + background colors based on feedback state
                                let borderColor = 'rgba(255,107,53,0.1)';
                                let bgColor = 'rgba(255,255,255,0.03)';
                                let labelBg = 'rgba(255,107,53,0.1)';
                                let labelColor = '#94a394';
                                let textWeight = '400';
                                let opacityVal = 1;

                                if (isCorrectReveal) {
                                    borderColor = '#10b981';
                                    bgColor = 'rgba(16,185,129,0.12)';
                                    labelBg = '#10b981';
                                    labelColor = '#0f1a0f';
                                    textWeight = '700';
                                } else if (isWrongPick) {
                                    borderColor = '#f43f5e';
                                    bgColor = 'rgba(244,63,94,0.12)';
                                    labelBg = '#f43f5e';
                                    labelColor = 'white';
                                    textWeight = '700';
                                } else if (isSelected && !showFeedback) {
                                    borderColor = '#ff6b35';
                                    bgColor = 'rgba(255,107,53,0.12)';
                                    labelBg = '#ff6b35';
                                    labelColor = '#0f1a0f';
                                    textWeight = '700';
                                } else if (showFeedback) {
                                    opacityVal = 0.35;
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleSelect(q.id, option)}
                                        disabled={!!justSelected}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            width: '100%', padding: '18px 20px',
                                            borderRadius: '10px', textAlign: 'left', cursor: justSelected ? 'default' : 'pointer',
                                            border: `2px solid ${borderColor}`,
                                            background: bgColor,
                                            color: 'var(--text-primary)',
                                            boxShadow: (isCorrectReveal || isWrongPick) ? `0 0 20px ${borderColor}40` : 'none',
                                            transition: 'all 0.25s', opacity: opacityVal,
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!justSelected && !isSelected) {
                                                (e.currentTarget as HTMLElement).style.background = 'rgba(255,107,53,0.06)';
                                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,107,53,0.3)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected && !showFeedback) {
                                                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,107,53,0.1)';
                                            }
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <span style={{
                                                width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                borderRadius: '6px', flexShrink: 0,
                                                background: labelBg,
                                                color: labelColor,
                                                fontSize: '13px', fontWeight: '900', transition: 'all 0.25s',
                                            }}>
                                                {OPTION_LABELS[i]}
                                            </span>
                                            <span style={{ fontSize: '16px', fontWeight: textWeight }}>{option}</span>
                                        </div>
                                        {isCorrectReveal && <CheckCircle size={20} color="#10b981" />}
                                        {isWrongPick && <XCircle size={20} color="#f43f5e" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Action footer */}
                <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '13px', fontWeight: '600', color: '#4a5e4a',
                        background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6,
                        transition: 'opacity 0.2s',
                    }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}>
                        <Flag size={15} /> Report Issue
                    </button>

                    {!justSelected && (
                        <button
                            onClick={() => { if (isLast) submitQuiz(answers); else advanceQuestion(); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '12px 28px', borderRadius: '10px',
                                background: '#ff6b35', color: '#0f1a0f',
                                fontWeight: '900', fontSize: '15px', cursor: 'pointer', border: 'none',
                                boxShadow: '0 0 20px rgba(255,107,53,0.4)',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                        >
                            {isLast ? 'Submit Quiz' : 'Next Question'} →
                        </button>
                    )}
                    {justSelected && (
                        <p style={{ fontSize: '13px', fontWeight: '700', color: justSelected === q.answer ? '#10b981' : '#f43f5e' }}>
                            {justSelected === q.answer ? '✅ Correct!' : `❌ Wrong — correct: ${q.answer}`}
                        </p>
                    )}
                </div>
            </main>

            {/* ===== FOOTER STATS ===== */}
            <footer style={{
                width: '100%', maxWidth: '900px',
                padding: '28px 24px',
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                borderTop: '1px solid rgba(255,107,53,0.1)',
                marginTop: '40px', opacity: 0.65,
            }}>
                {[
                    { label: 'Accuracy', value: `${Math.round((Object.keys(answers).length / (current + 1)) * 100)}%` },
                    { label: 'Avg. Time', value: `${avgTime}s` },
                    { label: 'Rank', value: `#—` },
                ].map(stat => (
                    <div key={stat.label} style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', color: '#ff6b35', marginBottom: '4px' }}>
                            {stat.label}
                        </p>
                        <p style={{ fontSize: '18px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </footer>
        </div>
    );
}

// ─── Outer page wraps in Suspense (required for useSearchParams in Next.js) ────
export default function QuizPage() {
    return (
        <Suspense fallback={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-muted)' }}>
                Loading quiz…
            </div>
        }>
            <QuizContent />
        </Suspense>
    );
}
