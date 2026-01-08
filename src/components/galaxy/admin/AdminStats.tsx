'use client';

import { useState, useEffect } from 'react';
import { getAdminStatsAction } from '@/app/galaxy/actions';
import { Users, AlertTriangle, Heart, Loader2 } from 'lucide-react';

export default function AdminStats() {
    const [stats, setStats] = useState({ users: 0, pendingReports: 0, matches: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminStatsAction()
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-white/50" /></div>;

    const cards = [
        {
            label: 'Total Users',
            value: stats.users,
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        {
            label: 'Pending Reports',
            value: stats.pendingReports,
            icon: AlertTriangle,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20'
        },
        {
            label: 'Total Matches',
            value: stats.matches,
            icon: Heart,
            color: 'text-pink-500',
            bg: 'bg-pink-500/10',
            border: 'border-pink-500/20'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, i) => (
                <div key={i} className={`p-6 rounded-3xl border ${card.border} ${card.bg} flex flex-col items-center justify-center gap-2`}>
                    <card.icon size={32} className={card.color} />
                    <h3 className="text-3xl font-bold text-white">{card.value}</h3>
                    <p className="text-white/60 text-sm font-medium uppercase tracking-wider">{card.label}</p>
                </div>
            ))}
        </div>
    );
}
