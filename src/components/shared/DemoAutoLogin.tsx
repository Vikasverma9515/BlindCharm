'use client';

import { useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { DEMO_MODE } from '@/lib/demoData';

// Silently signs the visitor into the "demo" NextAuth provider whenever there's
// no session, so the whole app behaves as if logged in without touching Supabase.
export default function DemoAutoLogin() {
    const { status } = useSession();
    const attempted = useRef(false);

    useEffect(() => {
        if (!DEMO_MODE || status !== 'unauthenticated' || attempted.current) return;
        attempted.current = true;
        signIn('demo', { redirect: false });
    }, [status]);

    return null;
}
