import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'LeetFlix – Gamified TV Quiz Platform',
  description:
    'Test your TV show knowledge, compete on leaderboards, and track your progress with LeetFlix.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 64px)' }}>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
