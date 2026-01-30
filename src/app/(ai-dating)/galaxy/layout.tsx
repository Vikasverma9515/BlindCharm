import GalaxyBottomNav from '@/components/shared/GalaxyBottomNav';
import TopNav from '@/components/shared/TopNav';
import { DiscoveryProvider } from '@/context/DiscoveryContext';
import NotificationPrompter from '@/features/ai-dating/components/galaxy/notifications/NotificationPrompter';

export default function GalaxyLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <DiscoveryProvider>
            <div className="h-dvh w-full bg-black text-white flex flex-col overflow-hidden">
                {/* Top Nav - Block Element */}
                <div className="shrink-0 z-50">
                    <TopNav />
                </div>

                {/* Main Content - Flex Grow */}
                <main className="flex-1 w-full relative overflow-hidden">
                    {children}
                    <NotificationPrompter />
                </main>

                {/* Bottom Nav - Block Element */}
                <div className="shrink-0 z-50">
                    <GalaxyBottomNav />
                </div>
            </div>
        </DiscoveryProvider>
    );
}
