'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { quizApi } from '@/lib/api';
import { AttemptResult } from '@/lib/types';
import { Trophy, CheckCircle, XCircle, Home, RotateCcw } from 'lucide-react';

function ScoreRing({ percentage }: { percentage: number }) {
    const size = 160;
    const r = 60;
    const c = 2 * Math.PI * r;
    const dash = (percentage / 100) * c;

    const color =
        percentage >= 80
            ? 'var(--accent-green)'
            : percentage >= 50
                ? 'var(--accent-yellow)'
                : 'var(--accent-red)';

    return (
        <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
            <svg width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="12"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth="12"
                    strokeDasharray={`${dash} ${c}`}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{
                        filter: `drop-shadow(0 0 8px ${color})`,
                        transition: 'stroke-dasharray 1s ease',
                    }}
                />
            </svg>
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <span style={{ fontSize: '32px', fontWeight: '900', color }}>{percentage}%</span>
            </div>
        </div>
    );
}

export default function ResultsPage() {
    const params = useParams();
    const attemptId = params.attemptId as string;
    const [result, setResult] = useState<AttemptResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        quizApi
            .getAttempt(attemptId)
            .then((res) => setResult(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [attemptId]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <p style={{ color: 'var(--text-muted)' }}>Loading results…</p>
            </div>
        );
    }

    if (!result) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
                Result not found.
            </div>
        );
    }

    const grade =
        result.percentage >= 80
            ? { label: 'Excellent! 🎉', color: 'var(--accent-green)' }
            : result.percentage >= 60
                ? { label: 'Good Job! 👍', color: 'var(--accent-cyan)' }
                : result.percentage >= 40
                    ? { label: 'Keep Practicing 💪', color: 'var(--accent-yellow)' }
                    : { label: 'Try Again 🔄', color: 'var(--accent-red)' };

    return (
        <div
            style={{
                maxWidth: '720px',
                margin: '0 auto',
                padding: '40px 24px',
            }}
        >
            {/* Score card */}
            <div
                className="glass"
                style={{
                    padding: '48px',
                    textAlign: 'center',
                    marginBottom: '32px',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(34,211,238,0.04))',
                }}
            >
                <div style={{ marginBottom: '16px' }}>
                    <Trophy size={32} color="var(--accent-yellow)" style={{ margin: '0 auto 12px' }} />
                    <h1
                        style={{
                            fontSize: '28px',
                            fontWeight: '900',
                            color: grade.color,
                            marginBottom: '4px',
                        }}
                    >
                        {grade.label}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                        Quiz Complete
                    </p>
                </div>

                <ScoreRing percentage={result.percentage} />

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '32px',
                        marginTop: '28px',
                    }}
                >
                    <div>
                        <p style={{ fontSize: '28px', fontWeight: '900', color: 'var(--accent-green)' }}>
                            {result.score}
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Correct</p>
                    </div>
                    <div style={{ width: '1px', background: 'var(--border)' }} />
                    <div>
                        <p style={{ fontSize: '28px', fontWeight: '900', color: 'var(--accent-red)' }}>
                            {result.total - result.score}
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Wrong</p>
                    </div>
                    <div style={{ width: '1px', background: 'var(--border)' }} />
                    <div>
                        <p style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-secondary)' }}>
                            {result.total}
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total</p>
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'center',
                        marginTop: '32px',
                    }}
                >
                    <Link
                        href="/"
                        className="btn-secondary"
                        style={{ textDecoration: 'none' }}
                    >
                        <Home size={16} />
                        Browse Shows
                    </Link>
                    <Link
                        href="/leaderboard"
                        className="btn-primary"
                        style={{ textDecoration: 'none' }}
                    >
                        <Trophy size={16} />
                        Leaderboard
                    </Link>
                </div>
            </div>

            {/* Answer breakdown */}
            <h2
                style={{
                    fontSize: '18px',
                    fontWeight: '800',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}
            >
                Answer Review
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {result.answers.map((a, i) => (
                    <div
                        key={a.questionId}
                        className="glass"
                        style={{
                            padding: '16px 20px',
                            borderColor: a.correct
                                ? 'rgba(16,185,129,0.25)'
                                : 'rgba(244,63,94,0.25)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                            }}
                        >
                            {a.correct ? (
                                <CheckCircle size={18} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            ) : (
                                <XCircle size={18} color="var(--accent-red)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            )}
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                                    Q{i + 1}: {a.questionText || `Question ${i + 1}`}
                                </p>
                                <p style={{ fontSize: '13px', color: a.correct ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                    Your answer: {a.selected || '(skipped)'}
                                </p>
                                {!a.correct && (
                                    <p style={{ fontSize: '13px', color: 'var(--accent-green)', marginTop: '2px' }}>
                                        Correct: {a.correctAnswer}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
