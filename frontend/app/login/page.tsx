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
    const [error, setError] = useState('');
    const { login } = useAuth();
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
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Sign in with your username or email</p>
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '14px' }}>
                            <AlertCircle size={15} />
                            {error}
                        </div>
                    )}

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

                        <button type="submit" className="btn-primary" disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '14px', fontSize: '15px', borderRadius: '12px' }}>
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
