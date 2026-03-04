'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { forumApi, showsApi } from '@/lib/api';
import { Post, Show } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import {
    MessageSquare, Plus, Lock, ChevronRight, Search, Tv,
} from 'lucide-react';

export default function ForumPage() {
    const searchParams = useSearchParams();
    const filterShowId = searchParams.get('showId');
    const { user } = useAuth();

    const [posts, setPosts] = useState<Post[]>([]);
    const [shows, setShows] = useState<Show[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Create form state
    const [fShowId, setFShowId] = useState('');
    const [fTitle, setFTitle] = useState('');
    const [fContent, setFContent] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        showsApi.getAll().then((r) => setShows(r.data)).catch(() => { });
    }, []);

    const loadPosts = () => {
        setLoading(true);
        forumApi
            .getPosts(filterShowId || undefined)
            .then((r) => setPosts(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadPosts(); }, [filterShowId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setCreating(true);
        try {
            await forumApi.createPost({ showId: fShowId, title: fTitle, content: fContent });
            setFTitle(''); setFContent(''); setFShowId(''); setShowCreate(false);
            loadPosts();
        } catch {
        } finally {
            setCreating(false);
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '26px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <MessageSquare size={24} color="var(--accent-cyan)" />
                        Community Forum
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Discuss your favorite shows with the community
                    </p>
                </div>
                {user && (
                    <button
                        className="btn-primary"
                        onClick={() => setShowCreate(!showCreate)}
                    >
                        <Plus size={16} />
                        New Post
                    </button>
                )}
            </div>

            {/* Show filter tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <Link href="/forum" style={{ padding: '6px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600', background: !filterShowId ? 'var(--accent)' : 'rgba(255,255,255,0.05)', color: !filterShowId ? 'white' : 'var(--text-secondary)', border: `1px solid ${!filterShowId ? 'var(--accent)' : 'var(--border)'}` }}>
                    All Shows
                </Link>
                {shows.slice(0, 5).map((s) => (
                    <Link key={s.id} href={`/forum?showId=${s.id}`} style={{ padding: '6px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600', background: filterShowId === s.id ? 'var(--accent)' : 'rgba(255,255,255,0.05)', color: filterShowId === s.id ? 'white' : 'var(--text-secondary)', border: `1px solid ${filterShowId === s.id ? 'var(--accent)' : 'var(--border)'}`, whiteSpace: 'nowrap' }}>
                        {s.name}
                    </Link>
                ))}
            </div>

            {/* Create post form */}
            {showCreate && user && (
                <div className="glass" style={{ padding: '24px', marginBottom: '24px', borderColor: 'rgba(99,102,241,0.3)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Create New Post</h3>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <select
                            className="input"
                            value={fShowId}
                            onChange={(e) => setFShowId(e.target.value)}
                            required
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', cursor: 'pointer' }}
                        >
                            <option value="">Select a show…</option>
                            {shows.map((s) => <option key={s.id} value={s.id} style={{ background: '#111827' }}>{s.name}</option>)}
                        </select>
                        <input
                            className="input"
                            placeholder="Post title…"
                            value={fTitle}
                            onChange={(e) => setFTitle(e.target.value)}
                            required
                            minLength={3}
                            maxLength={150}
                        />
                        <textarea
                            className="input"
                            placeholder="Share your thoughts…"
                            value={fContent}
                            onChange={(e) => setFContent(e.target.value)}
                            required
                            minLength={10}
                            rows={4}
                            style={{ resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-primary" disabled={creating}>
                                {creating ? 'Posting…' : 'Post'}
                            </button>
                            <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Posts list */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />)}
                </div>
            ) : posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <MessageSquare size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                    <p>No posts yet. Start the conversation!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {posts.map((post) => {
                        const show = shows.find((s) => s.id === post.showId);
                        return (
                            <Link
                                key={post.id}
                                href={`/forum/${post.id}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <div
                                    className="glass glass-hover"
                                    style={{ padding: '20px 24px', cursor: 'pointer' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                                {show && (
                                                    <span className="badge badge-cyan" style={{ fontSize: '11px' }}>
                                                        <Tv size={10} />
                                                        {show.name}
                                                    </span>
                                                )}
                                                {post.isLocked && (
                                                    <span className="badge badge-red" style={{ fontSize: '11px' }}>
                                                        <Lock size={10} />
                                                        Locked
                                                    </span>
                                                )}
                                            </div>
                                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                                {post.title}
                                            </h3>
                                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {post.content}
                                            </p>
                                            <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                    by <strong style={{ color: 'var(--text-secondary)' }}>{post.username}</strong>
                                                </span>
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <MessageSquare size={12} />
                                                    {post.commentCount} comments
                                                </span>
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                    {new Date(post.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '4px' }} />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
