'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Shield, Users, AlertTriangle, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AdminOverview from '@/components/galaxy/admin/AdminOverview';
import UserTable from '@/components/galaxy/admin/UserTable';
import ReportsFeed from '@/components/galaxy/admin/ReportsFeed';

import { useSession } from 'next-auth/react';

export default function AdminPage() {
    const router = useRouter();
    const { data: session, status } = useSession(); // Use NextAuth session
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports'>('overview');
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'loading') return;

        // If not authenticated via NextAuth, redirect to login
        if (status === 'unauthenticated') {
            console.log("[AdminPage] Unauthenticated via NextAuth. Redirecting.");
            router.push('/login');
            return;
        }

        // If authenticated, check admin status using the session user ID
        if (session?.user) {
            checkAdmin((session.user as any).id);
        }
    }, [session, status]);

    const checkAdmin = async (userId: string) => {
        try {
            console.log("[AdminPage] Checking admin status for:", userId);

            const { data: userData, error } = await supabase
                .from('users')
                .select('is_admin')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error("[AdminPage] DB Error:", error);
                router.push('/galaxy/profile');
                return;
            }

            if (!userData?.is_admin) {
                console.warn("[AdminPage] User is not admin. Redirecting.");
                router.push('/galaxy/profile');
                return;
            }

            console.log("[AdminPage] Admin Access Approved.");
            setIsAdmin(true);
        } catch (e) {
            console.error("[AdminPage] Exception:", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white/50">Loading Admin Portal...</div>;

    if (!isAdmin) return null;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.push('/galaxy/profile')}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="text-red-500 fill-red-500/20" />
                        Admin Portal
                    </h1>
                    <p className="text-white/40 text-sm">Manage users, safety, and system health.</p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-wrap gap-2 mb-8">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-2
                        ${activeTab === 'overview' ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
                >
                    <Activity size={16} /> Overview
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-2
                        ${activeTab === 'users' ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
                >
                    <Users size={16} /> User Management
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-2
                        ${activeTab === 'reports' ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
                >
                    <AlertTriangle size={16} /> Reports Console
                </button>
            </div>

            {/* Content Content */}
            <div className="animate-in fade-in duration-300">
                {activeTab === 'overview' && <AdminOverview />}
                {activeTab === 'users' && <UserTable />}
                {activeTab === 'reports' && <ReportsFeed />}
            </div>
        </div>
    );
}
