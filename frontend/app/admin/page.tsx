'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { UploadReport } from '@/lib/types';
import Swal from 'sweetalert2';
import {
    Shield,
    Upload,
    CheckCircle,
    XCircle,
    FileJson,
    Users,
    AlertCircle,
    Star,
    ClipboardPaste,
    File as FileIcon,
    X,
    Loader2,
} from 'lucide-react';

const EXAMPLE_JSON = `[
  {
    "showName": "Breaking Bad",
    "seasonName": "Season 1",
    "posterUrl": "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    "question": "What subject does Walter White teach?",
    "options": ["Chemistry", "Physics", "Biology", "Math"],
    "answer": "Chemistry"
  }
]`;

type UploadMode = 'file' | 'paste';

export default function AdminPage() {
    const router = useRouter();
    const { user, isAdmin, loading } = useAuth();
    const fileRef = useRef<HTMLInputElement>(null);

    const [tab, setTab] = useState<'upload' | 'users'>('upload');
    const [uploadMode, setUploadMode] = useState<UploadMode>('file');
    const [uploading, setUploading] = useState(false);
    const [report, setReport] = useState<UploadReport | null>(null);
    const [uploadError, setUploadError] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [pasteJson, setPasteJson] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [promoting, setPromoting] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) router.push('/');
    }, [loading, user, isAdmin]);

    useEffect(() => {
        if (tab === 'users') {
            setLoadingUsers(true);
            adminApi.getUsers().then((r) => setUsers(r.data)).catch(() => { }).finally(() => setLoadingUsers(false));
        }
    }, [tab]);

    const processUpload = async (file: File) => {
        setUploading(true);
        setReport(null);
        setUploadError('');
        try {
            const res = await adminApi.uploadQuiz(file);
            const r = res.data as UploadReport;
            setReport(r);
            Swal.fire({
                icon: r.failed > 0 ? 'warning' : 'success',
                title: r.failed > 0 ? 'Upload Completed with Errors' : 'Upload Successful! 🎉',
                html: `
                    <div style="text-align:left;font-size:15px;line-height:2">
                        <b>Total entries:</b> ${r.total}<br/>
                        <b style="color:#22c55e">✅ Success:</b> ${r.success}<br/>
                        ${r.failed > 0 ? `<b style="color:#f87171">❌ Failed:</b> ${r.failed}<br/>` : ''}
                        ${r.errors?.length ? `<details style="margin-top:8px"><summary style="cursor:pointer;color:#ff6b35">View errors</summary><pre style="font-size:12px;max-height:150px;overflow:auto;background:#111;padding:8px;border-radius:8px;margin-top:4px">${r.errors.map(e => `#${e.index}: ${e.reason}`).join('\n')}</pre></details>` : ''}
                    </div>
                `,
                background: '#162418',
                color: '#e8f5e8',
                confirmButtonColor: '#ff6b35',
                confirmButtonText: 'Got it',
            });
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Upload failed. Check your JSON format.';
            setUploadError(msg);
            Swal.fire({
                icon: 'error',
                title: 'Upload Failed',
                text: msg,
                background: '#162418',
                color: '#e8f5e8',
                confirmButtonColor: '#ff6b35',
            });
        } finally {
            setUploading(false);
        }
    };

    // Auto-upload when file is selected (Bug 1 fix)
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        await processUpload(file);
    };

    // Paste JSON submit (Bug 3 fix)
    const handlePasteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploadError('');
        setReport(null);

        let parsed: any;
        try {
            parsed = JSON.parse(pasteJson);
        } catch {
            setUploadError('Invalid JSON. Please check your syntax.');
            return;
        }

        const blob = new Blob([JSON.stringify(parsed)], { type: 'application/json' });
        await processUpload(blob as unknown as globalThis.File);
    };

    const handlePromote = async (userId: string) => {
        setPromoting(userId);
        try {
            await adminApi.promoteUser(userId);
            setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: 'admin' } : u));
        } catch {
        } finally {
            setPromoting(null);
        }
    };

    const clearUpload = () => {
        setSelectedFile(null);
        setReport(null);
        setUploadError('');
        if (fileRef.current) fileRef.current.value = '';
    };

    if (loading || !isAdmin) return null;

    return (
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}>
            {/* Header */}
            <div
                className="glass"
                style={{
                    padding: '24px 28px',
                    marginBottom: '28px',
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(99,102,241,0.05))',
                    borderColor: 'rgba(245,158,11,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                }}
            >
                <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={24} color="white" />
                </div>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '2px' }}>Admin Dashboard</h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Manage quiz content and users</p>
                </div>
            </div>

            {/* Main Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {[
                    { id: 'upload', label: 'Quiz Upload', icon: <Upload size={15} /> },
                    { id: 'users', label: 'Users', icon: <Users size={15} /> },
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id as 'upload' | 'users')}
                        style={{
                            padding: '10px 20px', borderRadius: '10px',
                            border: `1px solid ${tab === t.id ? 'var(--accent)' : 'var(--border)'}`,
                            background: tab === t.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                            color: tab === t.id ? 'var(--accent-light)' : 'var(--text-secondary)',
                            fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                        }}
                    >
                        {t.icon}{t.label}
                    </button>
                ))}
            </div>

            {/* Upload Tab */}
            {tab === 'upload' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                    {/* Upload panel */}
                    <div>
                        <div className="glass" style={{ padding: '28px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileJson size={18} color="var(--accent-cyan)" />
                                Bulk Quiz Upload
                            </h2>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                                Upload a JSON file or paste JSON directly. Shows and seasons are auto-created.
                            </p>

                            {/* Upload mode switcher */}
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px' }}>
                                {[
                                    { id: 'file', label: 'Upload File', icon: <Upload size={13} /> },
                                    { id: 'paste', label: 'Paste JSON', icon: <ClipboardPaste size={13} /> },
                                ].map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => { setUploadMode(m.id as UploadMode); clearUpload(); }}
                                        style={{
                                            flex: 1, padding: '8px 14px', borderRadius: '8px', border: 'none',
                                            background: uploadMode === m.id ? 'var(--accent)' : 'transparent',
                                            color: uploadMode === m.id ? 'white' : 'var(--text-secondary)',
                                            fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {m.icon}{m.label}
                                    </button>
                                ))}
                            </div>

                            {/* FILE MODE */}
                            {uploadMode === 'file' && (
                                <div>
                                    {/* File selected indicator */}
                                    {selectedFile ? (
                                        <div
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '12px',
                                                padding: '14px 16px', borderRadius: '12px',
                                                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                                                marginBottom: '12px',
                                            }}
                                        >
                                            <FileIcon size={18} color="var(--accent-light)" />
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedFile.name}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            {!uploading && (
                                                <button onClick={clearUpload} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        /* Drop zone — click to select + auto-upload */
                                        <div
                                            style={{
                                                border: '2px dashed rgba(99,102,241,0.3)', borderRadius: '12px',
                                                padding: '40px', textAlign: 'center', cursor: 'pointer',
                                                transition: 'all 0.2s', background: 'rgba(99,102,241,0.03)',
                                                marginBottom: '12px',
                                            }}
                                            onClick={() => fileRef.current?.click()}
                                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.7)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)')}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                const file = e.dataTransfer.files[0];
                                                if (file) {
                                                    setSelectedFile(file);
                                                    processUpload(file);
                                                }
                                            }}
                                        >
                                            <Upload size={32} color="var(--accent)" style={{ margin: '0 auto 12px' }} />
                                            <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>
                                                Click or drag & drop a JSON file
                                            </p>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                Auto-uploads immediately on selection · Max 5MB · .json only
                                            </p>
                                            <input
                                                ref={fileRef}
                                                type="file"
                                                accept=".json,application/json"
                                                style={{ display: 'none' }}
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    )}

                                    {/* Uploading state */}
                                    {uploading && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                                            <Loader2 size={16} color="var(--accent-light)" style={{ animation: 'spin 1s linear infinite' }} />
                                            <span style={{ fontSize: '13px', color: 'var(--accent-light)', fontWeight: '600' }}>
                                                Uploading & validating questions…
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* PASTE MODE */}
                            {uploadMode === 'paste' && (
                                <form onSubmit={handlePasteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <textarea
                                        className="input"
                                        placeholder={`Paste your JSON here:\n[\n  {\n    "showName": "...",\n    ...  }\n]`}
                                        value={pasteJson}
                                        onChange={(e) => setPasteJson(e.target.value)}
                                        rows={10}
                                        required
                                        style={{
                                            resize: 'vertical', fontFamily: 'monospace', fontSize: '12px',
                                            lineHeight: '1.5',
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={uploading || !pasteJson.trim()}
                                        style={{ justifyContent: 'center', padding: '12px' }}
                                    >
                                        {uploading ? (
                                            <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
                                        ) : (
                                            <><ClipboardPaste size={16} /> Process JSON</>
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* Error */}
                            {uploadError && (
                                <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', fontSize: '13px', marginTop: '12px' }}>
                                    <AlertCircle size={15} />
                                    {uploadError}
                                </div>
                            )}
                        </div>

                        {/* Upload report */}
                        {report && !uploading && (
                            <div className="glass" style={{ padding: '20px', marginTop: '16px', borderColor: report.failed === 0 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {report.failed === 0
                                        ? <CheckCircle size={16} color="var(--accent-green)" />
                                        : <AlertCircle size={16} color="var(--accent-yellow)" />}
                                    Upload Report
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                                    {[
                                        { label: 'Total', value: report.total, color: 'var(--text-secondary)' },
                                        { label: 'Added', value: report.success, color: 'var(--accent-green)' },
                                        { label: 'Failed', value: report.failed, color: 'var(--accent-red)' },
                                    ].map((s) => (
                                        <div key={s.label} style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                            <p style={{ fontSize: '22px', fontWeight: '900', color: s.color }}>{s.value}</p>
                                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{s.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {report.success > 0 && (
                                    <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.08)', borderRadius: '8px', marginBottom: report.errors.length > 0 ? '12px' : 0 }}>
                                        <p style={{ fontSize: '13px', color: 'var(--accent-green)' }}>
                                            ✅ {report.success} question{report.success !== 1 ? 's' : ''} successfully added to Firestore.
                                        </p>
                                    </div>
                                )}

                                {report.errors.length > 0 && (
                                    <div>
                                        <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-red)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Errors ({report.errors.length})
                                        </p>
                                        <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {report.errors.map((err, i) => (
                                                <div key={i} style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '6px', padding: '8px 12px', fontSize: '12px' }}>
                                                    <span style={{ color: 'var(--accent-red)', fontWeight: '700' }}>Row {err.index + 1}: </span>
                                                    <span style={{ color: 'var(--text-secondary)' }}>{err.reason}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* JSON Schema guide */}
                    <div className="glass" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileJson size={15} color="var(--accent-light)" />
                            Required JSON Schema
                        </h3>
                        <pre
                            style={{
                                background: 'rgba(0,0,0,0.4)', borderRadius: '10px', padding: '16px',
                                fontSize: '12px', color: '#a5f3fc', overflowX: 'auto',
                                lineHeight: '1.6', fontFamily: 'monospace',
                                border: '1px solid rgba(34,211,238,0.15)',
                            }}
                        >
                            {EXAMPLE_JSON}
                        </pre>
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                'showName – Name of the TV show (auto-created)',
                                'seasonName – E.g. "Season 1" (auto-created)',
                                'posterUrl – (Optional) Poster image URL. Rendered on show cards and detail page',
                                'question – The quiz question text',
                                'options – Array of 2 or more answer strings',
                                'answer – Must exactly match one of the options',
                            ].map((rule) => (
                                <div key={rule} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    <CheckCircle size={13} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    {rule}
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', fontSize: '12px', color: 'var(--accent-yellow)' }}>
                            💡 <strong>Tip:</strong> You can upload multiple shows and seasons in a single JSON array. Duplicate questions are automatically skipped.
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {tab === 'users' && (
                <div className="glass" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 120px 100px 120px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <span>User</span>
                        <span>Role</span>
                        <span style={{ textAlign: 'center' }}>Quizzes</span>
                        <span style={{ textAlign: 'center' }}>Actions</span>
                    </div>
                    {loadingUsers ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading users…</div>
                    ) : (
                        users.map((u, i) => (
                            <div
                                key={u.id}
                                style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 120px', padding: '14px 24px', borderBottom: i < users.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center' }}
                            >
                                <div>
                                    <p style={{ fontSize: '14px', fontWeight: '700' }}>{u.username}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</p>
                                </div>
                                <span className={u.role === 'admin' ? 'badge badge-yellow' : 'badge badge-accent'} style={{ fontSize: '11px', width: 'fit-content' }}>
                                    {u.role === 'admin' ? '👑 Admin' : 'User'}
                                </span>
                                <span style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>{u.quizzesAttempted || 0}</span>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    {u.role !== 'admin' && (
                                        <button
                                            className="btn-secondary"
                                            onClick={() => handlePromote(u.id)}
                                            disabled={promoting === u.id}
                                            style={{ padding: '5px 10px', fontSize: '11px' }}
                                        >
                                            <Star size={11} />
                                            {promoting === u.id ? '…' : 'Promote'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}
