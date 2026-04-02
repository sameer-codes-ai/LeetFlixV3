'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Zap, Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const { register, loginWithGoogle } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(username, email, password);
            router.push('/');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Registration failed');
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
            setError(err?.message || 'Google sign-up failed. Please try again.');
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: 'calc(100vh - 64px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                background: 'radial-gradient(ellipse at 50% 0%, rgba(34,211,238,0.06) 0%, transparent 60%)',
            }}
        >
            <div style={{ width: '100%', maxWidth: '420px' }}>
                <div className="glass" style={{ padding: '40px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                background: 'linear-gradient(135deg, #22d3ee, #6366f1)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                            }}
                        >
                            <Zap size={24} color="white" />
                        </div>
                        <h1 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                            Join LeetFlix
                        </h1>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                            Start your quiz journey today
                        </p>
                    </div>

                    {error && (
                        <div
                            style={{
                                background: 'rgba(244,63,94,0.1)',
                                border: '1px solid rgba(244,63,94,0.3)',
                                borderRadius: '10px',
                                padding: '12px 16px',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--accent-red)',
                                fontSize: '14px',
                            }}
                        >
                            <AlertCircle size={16} />
                            {Array.isArray(error) ? (error as string[]).join(', ') : error}
                        </div>
                    )}

                    {/* Google Sign Up Button */}
                    <button
                        type="button"
                        onClick={handleGoogle}
                        disabled={googleLoading || loading}
                        style={{
                            width: '100%', padding: '13px 16px', borderRadius: '12px', marginBottom: '20px',
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                            color: 'white', fontWeight: '700', fontSize: '14px', cursor: googleLoading ? 'wait' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            transition: 'background 0.2s', opacity: googleLoading ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => { if (!googleLoading) e.currentTarget.style.background = 'rgba(255,255,255,0.11)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {googleLoading ? 'Creating account…' : 'Sign up with Google'}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>or register with email</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            {
                                label: 'Username',
                                icon: <User size={15} />,
                                value: username,
                                onChange: setUsername,
                                type: 'text',
                                placeholder: 'cooluser123',
                                minLength: 3,
                                maxLength: 20,
                            },
                            {
                                label: 'Email',
                                icon: <Mail size={15} />,
                                value: email,
                                onChange: setEmail,
                                type: 'email',
                                placeholder: 'you@example.com',
                            },
                            {
                                label: 'Password',
                                icon: <Lock size={15} />,
                                value: password,
                                onChange: setPassword,
                                type: 'password',
                                placeholder: '••••••••',
                                minLength: 6,
                            },
                        ].map((field) => (
                            <div key={field.label}>
                                <label
                                    style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: 'var(--text-secondary)',
                                        display: 'block',
                                        marginBottom: '6px',
                                    }}
                                >
                                    {field.label}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-muted)',
                                            display: 'flex',
                                        }}
                                    >
                                        {field.icon}
                                    </span>
                                    <input
                                        className="input"
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        required
                                        minLength={field.minLength}
                                        maxLength={field.maxLength}
                                        style={{ paddingLeft: '36px' }}
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', marginTop: '4px', padding: '14px' }}
                        >
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                    </form>

                    <div className="divider" />
                    <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: 'var(--accent-light)', fontWeight: '600', textDecoration: 'none' }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
