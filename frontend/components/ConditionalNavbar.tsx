'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

// Pages that have their own sidebar navigation — skip the global navbar
const NO_NAVBAR_PATHS = ['/profile/'];

export default function ConditionalNavbar() {
    const pathname = usePathname();
    const hide = NO_NAVBAR_PATHS.some(prefix => pathname.startsWith(prefix));
    if (hide) return null;
    return <Navbar />;
}
