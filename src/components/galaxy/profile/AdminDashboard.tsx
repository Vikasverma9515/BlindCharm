'use client';

import { useState, useEffect } from 'react';
import { getAdminReportsAction, resolveReportAction } from '@/app/galaxy/actions';
import { Shield, Check, Ban, AlertTriangle, Loader2, ChevronDown, ChevronUp, MessageCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

interface Report {
    id: string;
    reason: string;
    details: string;
    status: string;
    created_at: string;
    reporter: { full_name: string; profile_picture: string };
    reported_id: string; // Needed for linking
    reported: { full_name: string; profile_picture: string };
    evidence?: {
        matchId?: string; // Add this
        chatLogs?: {
            id: string;
            sender_id: string;
            content: string;
            created_at: string;
        }[];
    };
}

export default function AdminDashboard() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedReport, setExpandedReport] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Investigation State
    const [investigatingReport, setInvestigatingReport] = useState<Report | null>(null);
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [chatLoading, setChatLoading] = useState(false);

    const openInvestigation = async (matchId: string, report: Report) => {
        setInvestigatingReport(report);
        setChatLoading(true);
        setChatHistory([]); // Reset
        try {
            const { getFullMatchChatHistoryAction } = await import('@/app/galaxy/actions');
            const msgs = await getFullMatchChatHistoryAction(matchId);
            setChatHistory(msgs);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load evidence");
        } finally {
            setChatLoading(false);
        }
    };

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await getAdminReportsAction();
            setReports(data || []);
        } catch (error) {
            console.error("Failed to fetch reports:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleAction = async (reportId: string, action: 'dismiss' | 'ban') => {
        try {
            setActionLoading(reportId);
            await resolveReportAction(reportId, action);
            toast.success(action === 'ban' ? "User banned & report resolved" : "Report dismissed");
            fetchReports(); // Refresh
        } catch (error) {
            console.error("Action failed:", error);
            toast.error("Failed to perform action");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return null; // Don't show anything while loading to avoid flickering
    if (reports.length === 0) return null; // Don't show dashboard if no reports (or empty)

    return (
        <div className="w-full max-w-2xl mx-auto mt-12 mb-20 px-4">
            <div className="bg-zinc-900 border border-red-500/20 rounded-3xl overflow-hidden">
                <div className="bg-red-500/10 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-red-500" />
                        <h2 className="text-red-500 font-bold text-lg">Admin Dashboard</h2>
                    </div>
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {reports.filter(r => r.status === 'pending').length} Pending
                    </span>
                </div>

                <div className="divide-y divide-white/10">
                    {reports.map((report) => (
                        <div key={report.id} className="bg-zinc-900/50">
                            <div
                                onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                                className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${report.status === 'pending' ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
                                    <div>
                                        <p className="text-white font-medium text-sm">{report.reason}</p>
                                        <p className="text-white/40 text-xs">
                                            Reported <b>{report.reported?.full_name || 'Unknown'}</b> • {new Date(report.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                {expandedReport === report.id ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                            </div>

                            {expandedReport === report.id && (
                                <div className="px-6 pb-6 pt-2 border-t border-white/5 bg-black/20">
                                    <div className="flex gap-8 mb-6 text-sm">
                                        <div>
                                            <span className="block text-white/40 text-xs uppercase mb-2">Reporter</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden relative">
                                                    {report.reporter?.profile_picture ? (
                                                        <Image src={report.reporter.profile_picture} alt="" fill className="object-cover" />
                                                    ) : <div className="w-full h-full bg-blue-500" />}
                                                </div>
                                                <span className="text-white/80">{report.reporter?.full_name || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="block text-white/40 text-xs uppercase mb-2">Reported User</span>
                                            <Link
                                                href="/admin"
                                                className="flex items-center gap-2 hover:bg-white/5 rounded-lg pr-3 transition-colors group"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden relative">
                                                    {report.reported?.profile_picture ? (
                                                        <Image src={report.reported.profile_picture} alt="" fill className="object-cover" />
                                                    ) : <div className="w-full h-full bg-red-500" />}
                                                </div>
                                                <span className="text-white/80 group-hover:text-white transition-colors">{report.reported?.full_name || 'N/A'}</span>
                                                <ArrowRight size={12} className="text-white/20 group-hover:text-white/60" />
                                            </Link>
                                        </div>
                                    </div>

                                    {report.details && (
                                        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/5 text-sm text-white/80">
                                            <span className="text-xs text-white/40 uppercase tracking-wider block mb-2">User Note</span>
                                            <p className="italic">"{report.details}"</p>
                                        </div>
                                    )}

                                    {/* Chat Evidence */}
                                    {report.evidence?.chatLogs && report.evidence.chatLogs.length > 0 && (
                                        <div className="mb-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                <MessageCircle size={14} className="text-purple-400" />
                                                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Chat Evidence (Last {report.evidence.chatLogs.length})</span>
                                            </div>
                                            <div className="bg-black/40 rounded-xl border border-white/5 p-4 space-y-3 max-h-60 overflow-y-auto">
                                                {report.evidence.chatLogs.map((msg) => {
                                                    const isReportedUser = msg.sender_id === report.reported_id;
                                                    return (
                                                        <div key={msg.id} className={`flex flex-col ${isReportedUser ? 'items-end' : 'items-start'}`}>
                                                            <div className={`px-3 py-2 rounded-xl text-xs max-w-[85%] ${isReportedUser
                                                                ? 'bg-red-500/10 text-red-200 rounded-br-none border border-red-500/20'
                                                                : 'bg-white/10 text-white/80 rounded-bl-none'
                                                                }`}>
                                                                <span className="block text-[10px] opacity-50 mb-1">
                                                                    {isReportedUser ? 'Reported User' : 'Reporter'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                {msg.content}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Investigation Controls */}
                                    <div className="mb-6 grid grid-cols-2 gap-3">
                                        {report.evidence?.matchId ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openInvestigation(report.evidence!.matchId!, report);
                                                }}
                                                className="col-span-2 py-3 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <MessageCircle size={16} />
                                                Open Investigation Console
                                            </button>
                                        ) : (
                                            <div className="col-span-2 py-3 bg-white/5 text-white/30 rounded-xl flex items-center justify-center gap-2 text-sm italic border border-white/5">
                                                No Match History Found
                                            </div>
                                        )}
                                    </div>

                                    {report.status === 'pending' ? (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleAction(report.id, 'dismiss')}
                                                disabled={!!actionLoading}
                                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Check size={16} /> Dismiss
                                            </button>
                                            <button
                                                onClick={() => handleAction(report.id, 'ban')}
                                                disabled={!!actionLoading}
                                                className="flex-1 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                            >
                                                {actionLoading === report.id ? <Loader2 className="animate-spin" size={16} /> : <Ban size={16} />}
                                                Ban User
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center p-2 text-white/40 text-sm">
                                            This report was {report.status}.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Investigation Modal */}
            {investigatingReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-zinc-900 border border-fuchsia-500/30 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900">
                            <div>
                                <h3 className="text-fuchsia-400 font-bold text-lg flex items-center gap-2">
                                    <Shield size={18} /> Evidence Locker
                                </h3>
                                <p className="text-xs text-white/40">Reviewing chat logs for harassment check</p>
                            </div>
                            <button
                                onClick={() => setInvestigatingReport(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Chat Stats Bar */}
                        <div className="px-4 py-2 bg-black/30 flex items-center justify-between text-xs border-b border-white/5">
                            <span className="text-white/40">Total Messages: <span className="text-white">{chatHistory.length}</span></span>
                            <span className="text-white/40">Reported: <span className="text-red-400 font-bold">{investigatingReport.reported.full_name}</span></span>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/20">
                            {chatLoading ? (
                                <div className="flex items-center justify-center h-full text-white/30 gap-2">
                                    <Loader2 className="animate-spin" /> Retrieving encrypted logs...
                                </div>
                            ) : chatHistory.length === 0 ? (
                                <div className="text-center text-white/30 py-10 italic">
                                    No conversation history found.
                                </div>
                            ) : (
                                chatHistory.map((msg, i) => {
                                    const isReportedUser = msg.sender_id === investigatingReport.reported_id;
                                    // Hacky timestamp grouping
                                    const showTime = i === 0 || new Date(msg.created_at).getTime() - new Date(chatHistory[i - 1].created_at).getTime() > 600000;

                                    return (
                                        <div key={msg.id} className="space-y-1">
                                            {showTime && (
                                                <div className="text-center text-[10px] text-white/20 py-2">
                                                    {new Date(msg.created_at).toLocaleString()}
                                                </div>
                                            )}
                                            <div className={`flex flex-col ${isReportedUser ? 'items-end' : 'items-start'}`}>
                                                <div className={`px-4 py-2 max-w-[85%] text-sm rounded-2xl ${isReportedUser
                                                    ? 'bg-red-500/20 text-red-100 border border-red-500/20 rounded-br-none'
                                                    : 'bg-zinc-800 text-zinc-300 border border-white/5 rounded-bl-none'
                                                    }`}>
                                                    {msg.content}
                                                </div>
                                                <span className="text-[10px] text-white/20 mt-1 px-1">
                                                    {isReportedUser ? investigatingReport.reported.full_name : investigatingReport.reporter.full_name}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-white/10 bg-zinc-900 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    handleAction(investigatingReport.id, 'dismiss');
                                    setInvestigatingReport(null);
                                }}
                                className="py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors"
                            >
                                False Alarm (Dismiss)
                            </button>
                            <button
                                onClick={() => {
                                    handleAction(investigatingReport.id, 'ban');
                                    setInvestigatingReport(null);
                                }}
                                className="py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors shadow-lg shadow-red-500/20"
                            >
                                Confirmed (Ban User)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
