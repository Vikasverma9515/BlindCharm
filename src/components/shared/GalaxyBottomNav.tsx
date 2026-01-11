'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    RiCompass3Line, RiCompass3Fill,
    RiStarSmileLine, RiStarSmileFill,
    RiMessage3Line, RiMessage3Fill,
    RiUser3Line, RiUser3Fill
} from 'react-icons/ri';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import { supabase } from '@/lib/supabase';

export default function GalaxyBottomNav() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const userId = (session?.user as any)?.id;
    const unreadCount = useUnreadCount(userId);

    const [hasPicksNotification, setHasPicksNotification] = useState(false);

    useEffect(() => {
        if (!userId) return;

        const checkPicks = async () => {
            const today = new Date().toISOString().split('T')[0];
            const lastViewed = localStorage.getItem(`picks_viewed_${userId}`);

            if (lastViewed === today) {
                setHasPicksNotification(false);
                return;
            }

            // 1. Get Today's Picks
            const { data: picks } = await supabase
                .from('galaxy_daily_picks')
                .select('picked_profile_id')
                .eq('user_id', userId)
                .eq('picked_at', today);

            if (!picks || picks.length === 0) {
                setHasPicksNotification(false);
                return;
            }

            // 2. Check how many are already swiped
            const pickIds = picks.map(p => p.picked_profile_id);

            const { count: swipedCount } = await supabase
                .from('galaxy_matches')
                .select('*', { count: 'exact', head: true })
                .eq('user_a', userId)
                .in('user_b', pickIds);

            // Show dot ONLY if there are MORE picks than swipes (meaning unswiped ones exist)
            if ((swipedCount || 0) < picks.length) {
                setHasPicksNotification(true);
            } else {
                setHasPicksNotification(false);
            }
        };

        checkPicks();
    }, [userId]);

    const handlePicksClick = () => {
        if (!userId) return;
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`picks_viewed_${userId}`, today);
        setHasPicksNotification(false);
    };

    const isActive = (path: string) => pathname === path;

    // Hide on Chat Room pages (e.g. /galaxy/chat/[id])
    if (pathname?.startsWith('/galaxy/chat/')) {
        return null;
    }

    return (
        <motion.nav
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-white/10 pb-safe px-2"
        >
            <div className="flex items-center justify-between max-w-md mx-auto h-12">
                <NavItem
                    href="/galaxy"
                    icon={
                        <div className="relative w-7 h-7">
                            <Image
                                src="/logo3.png"
                                alt="BlindCharm"
                                fill
                                className={`object-contain ${isActive('/galaxy') ? 'opacity-100' : 'opacity-50 grayscale'}`}
                            />
                        </div>
                    }
                    isActive={isActive('/galaxy')}
                    label="Discover"
                />
                <NavItem
                    href="/galaxy/chat"
                    icon={isActive('/galaxy/chat') ? <RiMessage3Fill size={28} /> : <RiMessage3Line size={28} />}
                    isActive={isActive('/galaxy/chat')}
                    label="Chat"
                    badgeCount={unreadCount}
                />
                <NavItem
                    href="/galaxy/picks"
                    icon={isActive('/galaxy/picks') ? <RiStarSmileFill size={28} /> : <RiStarSmileLine size={28} />}
                    isActive={isActive('/galaxy/picks')}
                    label="Picks"
                    badgeCount={hasPicksNotification ? 1 : 0}
                    onClick={handlePicksClick}
                />
                <NavItem
                    href="/galaxy/profile"
                    icon={
                        session?.user?.image ? (
                            <div className={`relative w-7 h-7 rounded-full overflow-hidden border-2 ${isActive('/galaxy/profile') ? 'border-white' : 'border-white/20'}`}>
                                <Image
                                    src={session.user.image}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            isActive('/galaxy/profile') ? <RiUser3Fill size={28} /> : <RiUser3Line size={28} />
                        )
                    }
                    isActive={isActive('/galaxy/profile')}
                    label="Profile"
                />
            </div>
        </motion.nav>
    );
}

const NavItem = ({ href, icon, isActive, label, badgeCount, onClick }: {
    href: string;
    icon: React.ReactNode;
    isActive: boolean;
    label: string;
    badgeCount?: number;
    onClick?: () => void;
}) => {
    return (
        <Link href={href} onClick={onClick} className="relative group flex-1 flex flex-col items-center justify-center h-full">
            <div className={`relative transition-all duration-200 ${isActive ? 'text-white scale-110' : 'text-white/40 group-hover:text-white/60'}`}>
                {icon}
                {/* Notification Badge */}
                {/* Notification Dot */}
                {(badgeCount ?? 0) > 0 && (
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-black" />
                )}
            </div>
            {/* Active Indicator Dot */}
            {isActive && (
                <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-2 w-1 h-1 bg-white rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}
        </Link>
    );
};
