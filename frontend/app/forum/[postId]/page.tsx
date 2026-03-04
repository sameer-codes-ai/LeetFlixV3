'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { forumApi } from '@/lib/api';
import { Post } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import {
    MessageSquare, ArrowLeft, Lock, Shield, Send, Trash2,
} from 'lucide-react';

export default function PostDetailPage() {
    const params = useParams();
    const postId = params.postId as string;
    const { user, isAdmin } = useAuth();

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [commenting, setCommenting] = useState(false);

    const load = () => {
        forumApi.getPost(postId).then((r) => setPost(r.data)).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [postId]);

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !comment.trim()) return;
        setCommenting(true);
        try {
            await forumApi.createComment(postId, comment.trim());
            setComment('');
            load();
        } catch {
        } finally {
            setCommenting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this post?')) return;
        await forumApi.deletePost(postId);
        window.location.href = '/forum';
    };

    const handleToggleLock = async () => {
        if (!post) return;
        post.isLocked ? await forumApi.unlockPost(postId) : await forumApi.lockPost(postId);
        load();
    };

    if (loading) {
        return (
            <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>
                <div className="skeleton" style={{ height: '200px', borderRadius: '16px', marginBottom: '16px' }} />
                <div className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />
            </div>
        );
    }

    if (!post) return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Post not found</div>;

    return (
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>
            {/* Back */}
            <Link href="/forum" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', marginBottom: '20px' }}>
                <ArrowLeft size={16} /> Forum
            </Link>

            {/* Post */}
            <div className="glass" style={{ padding: '28px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                            {post.isLocked && (
                                <span className="badge badge-red" style={{ fontSize: '11px' }}>
                                    <Lock size={10} /> Locked
                                </span>
                            )}
                        </div>
                        <h1 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', lineHeight: '1.3' }}>{post.title}</h1>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            by <strong style={{ color: 'var(--text-secondary)' }}>{post.username}</strong>
                            {' · '}{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                    </div>

                    {/* Admin controls */}
                    {isAdmin && (
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            <button
                                onClick={handleToggleLock}
                                className="btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                                <Shield size={13} />
                                {post.isLocked ? 'Unlock' : 'Lock'}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="btn-danger"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                                <Trash2 size={13} />
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                <div className="divider" />
                <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                    {post.content}
                </p>
            </div>

            {/* Comments header */}
            <h2 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <MessageSquare size={18} color="var(--accent-cyan)" />
                {post.comments?.length ?? 0} Comments
            </h2>

            {/* Comments */}
            {post.comments && post.comments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                    {post.comments.map((c) => (
                        <div key={c.id} className="glass" style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-light)' }}>{c.username}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    {new Date(c.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                {c.content}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                    No comments yet. Be the first!
                </div>
            )}

            {/* Add comment */}
            {user && !post.isLocked ? (
                <div className="glass" style={{ padding: '20px' }}>
                    <form onSubmit={handleComment} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <textarea
                            className="input"
                            placeholder="Add a comment…"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                            minLength={1}
                            maxLength={500}
                            rows={3}
                            style={{ resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" className="btn-primary" disabled={commenting || !comment.trim()} style={{ fontSize: '13px', padding: '8px 18px' }}>
                                <Send size={14} />
                                {commenting ? 'Posting…' : 'Post Comment'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : !user ? (
                <div className="glass" style={{ padding: '20px', textAlign: 'center' }}>
                    <Link href="/login" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: '600' }}>Sign in</Link>
                    {' '}to join the discussion
                </div>
            ) : (
                <div className="glass" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                    <Lock size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    This thread is locked
                </div>
            )}
        </div>
    );
}
