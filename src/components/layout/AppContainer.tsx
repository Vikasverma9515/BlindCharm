'use client';

import { usePathname } from 'next/navigation';

export default function AppContainer({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Landing page ('/') gets full width, everything else gets mobile container
    const isLandingPage = pathname === '/';

    if (isLandingPage) {
        return <main className="min-h-screen bg-black">{children}</main>;
    }

    return (
        <>
            {/* Desktop Background (Hidden on Mobile) */}
            <div className="fixed inset-0 bg-zinc-950 -z-50 hidden md:flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="text-zinc-800 font-mono text-xs tracking-widest uppercase">BlindCharm Mobile View</div>
            </div>

            {/* Mobile App Container */}
            <div className="mx-auto max-w-[480px] min-h-screen bg-black relative shadow-2xl md:border-x md:border-white/5 flex flex-col">
                <div className="min-h-screen bg-black text-white flex flex-col">
                    <div className="flex-1 relative flex flex-col">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
