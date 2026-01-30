'use client';

import { ChevronLeft, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-24">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold">Notifications</h1>
            </div>

            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                    <Bell size={32} className="text-white/20" />
                </div>
                <div>
                    <h3 className="text-lg font-medium text-white/80">No notifications yet</h3>
                    <p className="text-sm text-white/40 mt-1">
                        We'll let you know when something important happens.
                    </p>
                </div>
            </div>
        </div>
    );
}
