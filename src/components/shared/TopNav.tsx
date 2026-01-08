'use client';

import { motion } from 'framer-motion';
import { Bell, Settings, SlidersHorizontal } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function TopNav() {
    const pathname = usePathname();
    const isDiscovery = pathname === '/galaxy' || pathname === '/galaxy/';

    // Hide TopNav on Daily Picks and Profile page (custom header)
    if (pathname === '/galaxy/picks' || pathname === '/galaxy/profile' || pathname === '/galaxy/settings' || pathname.startsWith('/galaxy/chat')) return null;

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="w-full bg-black/80 backdrop-blur-xl px-4 py-3"
        >
            <div className="max-w-md mx-auto flex items-center justify-between">
                {/* Left: Logo / Brand */}
                <Link href="/galaxy" className="flex items-center gap-3">
                    <div className="w-10 h-10 relative">
                        <Image
                            src="/logo3.png"
                            alt="BlindCharm"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="font-bold text-xl text-white tracking-tight">BlindCharm</span>
                </Link>

                {/* Right: Actions */}
                {/* Show Preferences on main discovery/galaxy pages, but hide on preferences and profile pages */}
                {pathname !== '/galaxy/discovery/preferences' && pathname !== '/galaxy/profile' && (
                    <div className="flex items-center gap-2">
                        <Link
                            href="/galaxy/discovery/preferences"
                            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
                        >
                            <SlidersHorizontal size={24} />
                        </Link>
                    </div>
                )}
            </div>
        </motion.header>
    );
}
