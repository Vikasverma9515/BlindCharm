'use client';

import { usePathname } from 'next/navigation';

export default function AppContainer({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Landing page ('/') and other public/marketing pages get full width
    const isMarketingPage =
        pathname === '/' ||
        pathname?.startsWith('/blog') ||
        pathname?.startsWith('/founder') ||
        pathname?.startsWith('/contact') ||
        pathname?.startsWith('/terms') ||
        pathname?.startsWith('/privacy') ||
        pathname?.startsWith('/safety-center') ||
        pathname?.startsWith('/community-guidelines') ||
        pathname?.startsWith('/dating-tips');

    if (isMarketingPage) {
        return <main className="min-h-screen w-full relative">{children}</main>;
    }

    return (
        <>
            {/* Desktop Background (Hidden on Mobile) */}
            <div className="fixed inset-0 bg-zinc-950 -z-50 hidden md:flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="text-zinc-800 font-mono text-xs tracking-widest uppercase">BlindCharm Mobile View</div>
            </div>

            {/* Mobile App Container */}
            {/* transform makes this the containing block for every `fixed` descendant (modals, chat,
                bottom nav, etc.) so they anchor to this 480px frame instead of the real viewport. */}
            <div
                className="mx-auto max-w-[480px] min-h-[100dvh] bg-black relative shadow-2xl md:border-x md:border-white/5 flex flex-col"
                style={{ transform: 'translateZ(0)' }}
            >
                <div className="h-[100dvh] bg-black text-white flex flex-col">
                    <div className="flex-1 relative flex flex-col overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
