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
    const [error, setError] = useState('');
    const { register } = useAuth();
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
