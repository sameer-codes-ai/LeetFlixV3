import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = Cookies.get('lf_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            Cookies.remove('lf_token');
            if (typeof window !== 'undefined') window.location.href = '/login';
        }
        return Promise.reject(err);
    },
);

export default api;

// Auth
export const authApi = {
    register: (data: { username: string; email: string; password: string }) =>
        api.post('/auth/register', data),
    login: (data: { identifier: string; password: string }) =>
        api.post('/auth/login', data),
};

// Users
export const usersApi = {
    getMe: () => api.get('/users/me'),
    getStats: (id: string) => api.get(`/users/${id}/stats`),
    getProfile: (id: string) => api.get(`/users/${id}/profile`),
};

// Shows
export const showsApi = {
    getAll: () => api.get('/shows'),
    getBySlug: (slug: string) => api.get(`/shows/${slug}`),
};

// Quiz
export const quizApi = {
    getQuestions: (seasonId: string) =>
        api.get(`/quiz/season/${seasonId}/questions`),
    submitAttempt: (data: {
        seasonId: string;
        showId: string;
        answers: { questionId: string; selected: string }[];
    }) => api.post('/quiz/attempt', data),
    getHistory: () => api.get('/quiz/history'),
    getAttempt: (id: string) => api.get(`/quiz/attempt/${id}`),
};

// Leaderboard
export const leaderboardApi = {
    getGlobal: (page = 1, limit = 20) =>
        api.get(`/leaderboard/global?page=${page}&limit=${limit}`),
    getShow: (showId: string, page = 1, limit = 20) =>
        api.get(`/leaderboard/show/${showId}?page=${page}&limit=${limit}`),
};

// Activity
export const activityApi = {
    get: (userId: string, year?: string) =>
        api.get(`/activity/${userId}${year ? `?year=${year}` : ''}`),
};

// Forum
export const forumApi = {
    getPosts: (showId?: string, page = 1) =>
        api.get(`/forum/posts${showId ? `?showId=${showId}&page=${page}` : `?page=${page}`}`),
    getPost: (id: string) => api.get(`/forum/posts/${id}`),
    createPost: (data: { showId: string; title: string; content: string }) =>
        api.post('/forum/posts', data),
    createComment: (postId: string, content: string) =>
        api.post(`/forum/posts/${postId}/comments`, { content }),
    deletePost: (id: string) => api.delete(`/forum/posts/${id}`),
    lockPost: (id: string) => api.patch(`/forum/posts/${id}/lock`),
    unlockPost: (id: string) => api.patch(`/forum/posts/${id}/unlock`),
};

// Admin
export const adminApi = {
    uploadQuiz: (file: File) => {
        const form = new FormData();
        form.append('file', file);
        return api.post('/admin/upload-quiz', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    getUsers: () => api.get('/admin/users'),
    promoteUser: (id: string) => api.patch(`/admin/users/${id}/promote`),
};
