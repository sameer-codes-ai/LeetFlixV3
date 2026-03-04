import { AuthProvider } from '@/lib/auth-context';
import '../../globals.css';

// Profile pages get their OWN layout — no global navbar.
// The profile page itself includes the sidebar navigation.
export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
}
