'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Zap, User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, loginWithGoogle } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(identifier, password);
            router.push('/');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError('');
        setGoogleLoading(true);
        try {
            await loginWithGoogle();
            router.push('/');
        } catch (err: any) {
            setError(err?.message || 'Google sign-in failed. Please try again.');
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', position: 'relative', overflow: 'hidden',
        }}>
            {/* BG orbs */}
            <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,107,53,0.07), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
                <div className="glass" style={{ padding: '44px 40px', border: '1px solid rgba(255,107,53,0.08)' }}>
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '14px',
                            background: 'linear-gradient(135deg, #ff6b35, #c084fc)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 18px', boxShadow: '0 0 24px rgba(255,107,53,0.4)',
                        }}>
                            <Zap size={26} color="white" fill="white" />
                        </div>
                        <h1 style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.5px', marginBottom: '6px' }}>Welcome back</h1>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Sign in to continue your quiz journey</p>
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '14px' }}>
                            <AlertCircle size={15} />
                            {error}
                        </div>
                    )}

                    {/* Google Sign In Button */}
                    <button
                        type="button"
                        onClick={handleGoogle}
                        disabled={googleLoading || loading}
                        style={{
                            width: '100%', padding: '13px 16px', borderRadius: '12px', marginBottom: '20px',
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                            color: 'white', fontWeight: '700', fontSize: '14px', cursor: googleLoading ? 'wait' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            transition: 'background 0.2s, border-color 0.2s', opacity: googleLoading ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => { if (!googleLoading) { e.currentTarget.style.background = 'rgba(255,255,255,0.11)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; } }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                    >
                        {/* Google SVG logo */}
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {googleLoading ? 'Signing in…' : 'Continue with Google'}
                    </button>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>or sign in with email</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Username or Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="input" type="text" placeholder="yourname or you@email.com"
                                    value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                                    required autoComplete="username" style={{ paddingLeft: '38px' }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="input" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    required style={{ paddingLeft: '38px', paddingRight: '42px' }} />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}>
                                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading || googleLoading}
                            style={{ width: '100%', justifyContent: 'center', marginTop: '4px', padding: '14px', fontSize: '15px', borderRadius: '12px' }}>
                            {loading ? 'Signing in…' : 'Sign In →'}
                        </button>
                    </form>

                    <div className="divider" />
                    <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        No account?{' '}
                        <Link href="/register" style={{ color: '#ff6b35', fontWeight: '700', textDecoration: 'none' }}>Create one free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
