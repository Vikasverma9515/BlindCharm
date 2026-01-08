'use client';

import { Drawer } from 'vaul';
import AIMatchmaker from '@/components/galaxy/AIMatchmaker';

interface IntentDrawerProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onMatchesFound: (results: any[], query: string) => void;
}

export default function IntentDrawer({ onMatchesFound, isOpen, onOpenChange }: IntentDrawerProps) {
    return (
        <Drawer.Root shouldScaleBackground open={isOpen} onOpenChange={onOpenChange}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                <Drawer.Content className="flex flex-col rounded-t-[32px] mt-24 max-h-[90vh] fixed bottom-0 left-0 right-0 z-50 outline-none">
                    {/* Floating Island Container */}
                    <div className="bg-[#0f0f0f]/95 backdrop-blur-2xl border-t border-white/10 shadow-2xl rounded-t-[32px] p-4 pb-8 safe-area-bottom flex flex-col overflow-hidden">
                        {/* Handle */}
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/20 mb-2" />

                        {/* Content - Full Height for Matchmaker */}
                        <div className="flex-1 overflow-hidden relative">
                            <AIMatchmaker onMatchesFound={onMatchesFound} />
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
