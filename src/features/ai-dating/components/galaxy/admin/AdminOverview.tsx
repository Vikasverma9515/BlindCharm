'use client';

import { useState, useEffect } from 'react';
import { getAdminStatsAction } from '@/app/(ai-dating)/galaxy/actions';
import {
    Users,
    TrendingUp,
    Activity,
    ShieldCheck,
    Filter,
    Heart,
    Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminOverview() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await getAdminStatsAction();
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-white/50 animate-pulse">Loading investor data...</div>;
    if (!stats) return <div className="p-8 text-red-400">Failed to load data</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. Hero Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    icon={<Users size={20} className="text-blue-400" />}
                    label="Total Users"
                    value={stats.users}
                    trend="+12% vs last month" // Mocked trend
                    color="blue"
                />
                <MetricCard
                    icon={<Heart size={20} className="text-fuchsia-400" />}
                    label="Matches"
                    value={stats.matches}
                    trend="4.2% conversion rate"
                    color="fuchsia"
                />
                <MetricCard
                    icon={<ShieldCheck size={20} className="text-green-400" />}
                    label="Verified Users"
                    value={stats.demographics.verified}
                    subValue={`${Math.round((stats.demographics.verified / stats.users) * 100)}% coverage`}
                    color="green"
                />
                <MetricCard
                    icon={<Activity size={20} className="text-orange-400" />}
                    label="Pending Reports"
                    value={stats.pendingReports}
                    trend="Needs Attention"
                    color="orange"
                />
            </div>

            {/* 2. Growth Chart & Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Growth Chart (2/3 width) */}
                <div className="lg:col-span-2 bg-zinc-900 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUp size={18} className="text-fuchsia-400" />
                                Growth Trajectory
                            </h3>
                            <p className="text-xs text-white/40">30-Day New User & Match Trend</p>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <GrowthChart data={stats.growthSeries} />
                    </div>
                </div>

                {/* Funnel (1/3 width) */}
                <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Filter size={18} className="text-blue-400" /> Convertion Funnel
                    </h3>
                    <FunnelChart data={stats.funnel} />
                </div>
            </div>

            {/* 3. Demographics & health */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Gender Distribution</h3>
                    <DemographicsChart data={stats.demographics} total={stats.users} />
                </div>

                <div className="bg-gradient-to-br from-fuchsia-900/20 to-zinc-900 border border-fuchsia-500/20 rounded-3xl p-6 flex flex-col justify-center items-center text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Investor Summary</h3>
                    <p className="text-white/60 text-sm max-w-sm">
                        "BlindCharm is showing strong early retention with a <span className="text-fuchsia-400 font-bold">{((stats.matches / stats.users) * 100).toFixed(2)}%</span> match rate.
                        Growth is consistent with healthy verified user adoption."
                    </p>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ icon, label, value, trend, subValue, color }: any) {
    const colors: any = {
        blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
        fuchsia: "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400",
        green: "bg-green-500/10 border-green-500/20 text-green-400",
        orange: "bg-orange-500/10 border-orange-500/20 text-orange-400"
    };

    return (
        <div className={`p-5 rounded-2xl border ${colors[color]} relative overflow-hidden group`}>
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-black/20 rounded-lg">{icon}</div>
                {trend && <span className="text-[10px] font-medium bg-black/20 px-2 py-1 rounded-full">{trend}</span>}
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-white/50">{label} {subValue && `• ${subValue}`}</div>
        </div>
    );
}

function GrowthChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) return null;

    // Normalize data for SVG
    const maxUsers = Math.max(...data.map((d: any) => d.users), 5); // Avoid div by zero
    const maxMatches = Math.max(...data.map((d: any) => d.matches), 5);
    const h = 200;
    const w = 600; // viewBox width

    // Create polyline points
    const userPoints = data.map((d: any, i: number) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - (d.users / maxUsers) * h;
        return `${x},${y}`;
    }).join(' ');

    const matchPoints = data.map((d: any, i: number) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - (d.matches / maxMatches) * (h * 0.8); // Scale matches slightly differently visually
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-full">
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible">
                {/* Grid lines */}
                <line x1="0" y1={h} x2={w} y2={h} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />

                {/* Users Line (Blue) */}
                <polyline
                    points={userPoints}
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]"
                />

                {/* Matches Line (Fuchsia) */}
                <polyline
                    points={matchPoints}
                    fill="none"
                    stroke="#e879f9"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_10px_rgba(232,121,249,0.5)]"
                />
            </svg>
            <div className="flex justify-center gap-6 mt-2 text-xs">
                <div className="flex items-center gap-2 text-blue-400">
                    <div className="w-2 h-2 rounded-full bg-blue-400" /> New Users
                </div>
                <div className="flex items-center gap-2 text-fuchsia-400">
                    <div className="w-2 h-2 rounded-full bg-fuchsia-400" /> Matches
                </div>
            </div>
        </div>
    );
}

function FunnelChart({ data }: { data: any }) {
    // Simple bar visual
    const max = Math.max(data.views, data.swipes, data.matches, 1);

    return (
        <div className="space-y-6 mt-4">
            <FunnelRow label="Profile Views" count={data.views} max={max} icon={<Eye size={14} />} color="bg-zinc-600" />
            <FunnelRow label="Swipes" count={data.swipes} max={max} icon={<Activity size={14} />} color="bg-blue-500" />
            <FunnelRow label="Matches" count={data.matches} max={max} icon={<Heart size={14} />} color="bg-fuchsia-500" />
        </div>
    );
}

function FunnelRow({ label, count, max, icon, color }: any) {
    const width = `${Math.max((count / max) * 100, 5)}%`;

    return (
        <div className="group">
            <div className="flex justify-between text-xs text-white/60 mb-1">
                <span className="flex items-center gap-2">{icon} {label}</span>
                <span className="text-white font-mono">{count}</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${color}`}
                />
            </div>
        </div>
    );
}

function DemographicsChart({ data, total }: any) {
    if (!total) return null;
    const malePct = (data.male / total) * 100;
    const femalePct = (data.female / total) * 100;
    const otherPct = 100 - malePct - femalePct;

    return (
        <div className="space-y-4">
            {/* Visual Bar */}
            <div className="h-4 w-full flex rounded-full overflow-hidden">
                <div style={{ width: `${malePct}%` }} className="bg-blue-500 h-full" />
                <div style={{ width: `${femalePct}%` }} className="bg-fuchsia-500 h-full" />
                <div style={{ width: `${otherPct}%` }} className="bg-zinc-500 h-full" />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/10">
                    <div className="text-lg font-bold text-blue-400">{data.male} <span className="text-xs opacity-70">({Math.round(malePct)}%)</span></div>
                    <div className="text-[10px] text-blue-400/60 uppercase">Men</div>
                </div>
                <div className="p-3 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/10">
                    <div className="text-lg font-bold text-fuchsia-400">{data.female} <span className="text-xs opacity-70">({Math.round(femalePct)}%)</span></div>
                    <div className="text-[10px] text-fuchsia-400/60 uppercase">Women</div>
                </div>
                <div className="p-3 bg-zinc-500/10 rounded-xl border border-zinc-500/10">
                    <div className="text-lg font-bold text-zinc-400">{data.other} <span className="text-xs opacity-70">({Math.round(otherPct)}%)</span></div>
                    <div className="text-[10px] text-zinc-400/60 uppercase">Unknown/Other</div>
                </div>
            </div>
        </div>
    );
}
