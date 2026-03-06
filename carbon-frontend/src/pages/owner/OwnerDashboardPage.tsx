/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi, reportApi } from '../../api/services';
import type { DashboardData } from '../../types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    Factory, Zap, Globe, Download, X, AlertCircle, Calendar, Leaf,
    ChevronRight, ArrowUpRight, ArrowDownRight, Plus
} from 'lucide-react';

import type { ScopeDashboardResponse } from '../../types';

const OwnerDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedScope, setSelectedScope] = useState<string | null>(null);
    const [isAllEmissionsModalOpen, setIsAllEmissionsModalOpen] = useState(false);
    const [scopeDetails, setScopeDetails] = useState<ScopeDashboardResponse | null>(null);
    const [allEmissionsDetails, setAllEmissionsDetails] = useState<any | null>(null);
    const [scopeLoading, setScopeLoading] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [showReportOptions, setShowReportOptions] = useState(false);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await dashboardApi.getOwnerDashboard();
                if (response.data.success) {
                    const d = response.data.data;
                    setData({
                        totalEmission: Number(d?.total_emissions ?? 0),
                        scope1Total: Number(d?.scope1_emissions ?? 0),
                        scope2Total: Number(d?.scope2_emissions ?? 0),
                        scope3Total: Number(d?.scope3_emissions ?? 0),
                        carbonIntensity: Number(d?.carbon_intensity ?? 0),
                        monthlyTrends: [],
                        categoryBreakdown: []
                    });
                } else {
                    setError(response.data.message);
                }
            } catch (err: any) {
                setError(err?.response?.data?.message || 'Failed to load dashboard data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 animate-pulse">Computing environmental impact...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-destructive/10 border border-destructive/30 p-8 rounded-2xl flex flex-col items-center gap-4 text-center max-w-lg mx-auto mt-12">
                <AlertCircle className="w-12 h-12 text-destructive" />
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">Data Connection Failure</h2>
                    <p className="text-muted-foreground">{error || "Could not retrieve analytical data."}</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-primary hover:bg-primary/90 px-6 py-2 rounded-lg transition-colors text-primary-foreground"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    const pieData = [
        { name: 'Scope 1 (Direct)', value: data.scope1Total, color: '#10b981' },
        { name: 'Scope 2 (Energy)', value: data.scope2Total, color: '#3b82f6' },
        { name: 'Scope 3 (Indirect)', value: data.scope3Total, color: '#f59e0b' },
    ];

    const handleScopeClick = async (scope: string) => {
        setSelectedScope(scope);
        setScopeLoading(true);
        try {
            const response = await dashboardApi.getScopeDashboard(scope);
            if (response.data.success) {
                setScopeDetails(response.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch scope details", err);
        } finally {
            setScopeLoading(false);
        }
    };

    const handleTotalEmissionsClick = async () => {
        setIsAllEmissionsModalOpen(true);
        setScopeLoading(true);
        try {
            const response = await dashboardApi.getAllEmissions();
            if (response.data.success) {
                setAllEmissionsDetails(response.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch all emissions", err);
        } finally {
            setScopeLoading(false);
        }
    };

    const handleDownloadReport = async (range: string) => {
        setReportLoading(true);
        setShowReportOptions(false);
        try {
            let startDate: string | undefined;
            const now = new Date();

            if (range === 'last_month') {
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString();
            } else if (range === 'last_3_months') {
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString();
            } else if (range === 'last_year') {
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString();
            }

            const response = await reportApi.downloadReport(startDate);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Carbon_Report_${range}_${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Report download failed", err);
            alert("Failed to generate report. Please try again.");
        } finally {
            setReportLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 text-slate-900 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800 leading-tight">
                        Welcome, {user?.userName || 'Owner'}
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">
                        {user?.industryName || 'ABC Pvt. Ltd.'} – Carbon Emission Dashboard
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#0F766E] text-white rounded-md text-sm font-semibold hover:bg-[#0d645d] transition-colors shadow-sm cursor-not-allowed opacity-90">
                        <Plus className="w-4 h-4" /> Add Facility
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowReportOptions(!showReportOptions)}
                            disabled={reportLoading}
                            className={`flex items-center gap-2 px-4 py-2 border border-[#0F766E] text-[#0F766E] rounded-md text-sm font-semibold transition-all shadow-sm ${reportLoading ? 'opacity-50' : 'hover:bg-teal-50'}`}
                        >
                            {reportLoading ? (
                                <div className="w-4 h-4 border-2 border-[#0F766E]/20 border-t-[#0F766E] rounded-full animate-spin"></div>
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            Generate Report
                        </button>

                        {showReportOptions && (
                            <div className="absolute right-0 mt-3 w-64 bg-surface/90 backdrop-blur-xl border border-border rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[60] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="p-3 grid gap-1">
                                    <button onClick={() => handleDownloadReport('full')} className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-muted rounded-xl transition-all flex items-center justify-between group">
                                        <span>Full Data History</span>
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                    </button>
                                    <button onClick={() => handleDownloadReport('last_month')} className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-muted rounded-xl transition-all flex items-center justify-between group">
                                        <span>Last 30 Days</span>
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                    </button>
                                    <button onClick={() => handleDownloadReport('last_3_months')} className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-muted rounded-xl transition-all flex items-center justify-between group">
                                        <span>Quarterly Summary</span>
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                    </button>
                                    <button onClick={() => handleDownloadReport('last_year')} className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-muted rounded-xl transition-all flex items-center justify-between group">
                                        <span>Annual Review</span>
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Live Indicator Mobile */}
            <div className="flex md:hidden bg-muted/50 backdrop-blur border border-border px-4 py-3 rounded-2xl items-center gap-3">
                <div className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Real-time Telemetry Active</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Emissions"
                    value={`${data.totalEmission.toLocaleString()} tCO2e`}
                    trend="5%"
                    trendUp={true}
                    trendText="from last year"
                    trendColor="text-red-500"
                    trendBg="bg-red-50"
                    sparklineColor="stroke-red-400"
                    onClick={handleTotalEmissionsClick}
                />
                <StatCard
                    title="Scope 1"
                    value={`${data.scope1Total.toLocaleString()} tCO2e`}
                    icon={<Factory className="w-5 h-5 text-white" />}
                    iconBg="bg-red-500"
                    trend="3%"
                    trendUp={true}
                    trendColor="text-red-500"
                    trendBg="bg-red-50"
                    onClick={() => handleScopeClick('SCOPE1')}
                />
                <StatCard
                    title="Scope 2"
                    value={`${data.scope2Total.toLocaleString()} tCO2e`}
                    icon={<Zap className="w-5 h-5 text-yellow-500" />}
                    iconBg="bg-yellow-50"
                    trend="2%"
                    trendUp={false}
                    trendColor="text-green-500"
                    trendBg="bg-green-50"
                    onClick={() => handleScopeClick('SCOPE2')}
                />
                <StatCard
                    title="Scope 3"
                    value={`${data.scope3Total.toLocaleString()} tCO2e`}
                    icon={<Globe className="w-5 h-5 text-purple-600" />}
                    iconBg="bg-purple-100"
                    trend="8%"
                    trendUp={true}
                    trendColor="text-red-500"
                    trendBg="bg-red-50"
                    onClick={() => handleScopeClick('SCOPE3')}
                />
            </div>

            {/* Middle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[250px]">
                {/* Emission Breakdown Bar Chart */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col h-full relative">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-sm">Emission Breakdown <span className="text-slate-400 font-normal">(tCO₂e)</span></h3>
                        <div className="border border-slate-200 rounded px-2 py-1 text-xs text-slate-600 font-medium">2024-25</div>
                    </div>
                    <div className="flex-1 w-full relative mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Scope 1', value: data.scope1Total, fill: '#1d4ed8' }, // dark blue
                                { name: 'Scope 2', value: data.scope2Total, fill: '#eab308' }, // amber
                                { name: 'Scope 3', value: data.scope3Total, fill: '#8b5cf6' }, // purple
                            ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    tickFormatter={(value) => value > 0 ? `${value / 1000}k` : '0'}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={[4, 4, 0, 0]}
                                    barSize={24}
                                >
                                    {[data.scope1Total, data.scope2Total, data.scope3Total].map((_, idx) => (
                                        <Cell key={`cell-${idx}`} fill={['#2563eb', '#eab308', '#8b5cf6'][idx]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Facility-wise Emissions */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col h-full relative">
                    <h3 className="font-bold text-sm mb-4">Facility-wise Emissions</h3>
                    <div className="flex-1 w-full relative -mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={65}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-sm font-bold tracking-tight text-slate-800">{data.totalEmission.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-500">tCO₂e</span>
                        </div>
                    </div>
                    <div className="mt-2 text-[10px] flex justify-center gap-4 items-center w-full px-4 mb-2">
                        {pieData.map((scope, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 whitespace-nowrap">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: scope.color }}></div>
                                <span className="text-slate-600">{scope.name.replace(/\(.*\)/, '').trim()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Metrics Panel */}
                <div className="flex flex-col gap-4">
                    {/* Net Zero Target */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-bold">Net Zero Target</h4>
                            <span className="text-slate-400">•••</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mb-4 pb-2 border-b border-slate-100">Target: 2030</div>
                        <div className="flex items-center justify-between text-xs font-bold mb-2">
                            <span>Progress</span>
                            <span className="text-green-600">60%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                    </div>

                    {/* Carbon Intensity */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-bold">Carbon Intensity</h4>
                            <span className="text-2xl font-black">{data.carbonIntensity.toFixed(2)}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mb-3">(tCO₂e / ton)</div>
                        <div className="text-green-600 text-[11px] font-bold text-right flex items-center justify-end gap-1 border-t border-slate-100 pt-3">
                            <ArrowDownRight className="w-3 h-3" /> 4% vs Last Year
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl px-5 pt-4 pb-5 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold mb-4">Facility Status</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[11px] font-semibold text-slate-500 border-b border-slate-100">
                                <tr>
                                    <th className="pb-2">Facility Name</th>
                                    <th className="pb-2">Location</th>
                                    <th className="pb-2">Reporting Year</th>
                                    <th className="pb-2">Data Status</th>
                                    <th className="pb-2">Last Updated</th>
                                    <th className="pb-2">Assigned User</th>
                                    <th className="pb-2">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-xs">
                                <tr className="hover:bg-slate-50">
                                    <td className="py-3 font-semibold">Plant A</td>
                                    <td className="py-3 text-slate-500">Odisha, India</td>
                                    <td className="py-3 text-slate-500">2024-25</td>
                                    <td className="py-3"><span className="bg-[#E0F2FE] text-[#0284C7] px-2 py-0.5 rounded-full text-[10px] font-bold">Complete</span></td>
                                    <td className="py-3 text-slate-500">20 Apr 2025</td>
                                    <td className="py-3 text-slate-500">R. Mehta</td>
                                    <td className="py-3"><button className="px-3 py-1 text-[#0F766E] border border-[#0F766E]/30 rounded text-xs font-semibold hover:bg-[#0F766E]/5 transition-colors">View</button></td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="py-3 font-semibold">Plant B</td>
                                    <td className="py-3 text-slate-500">Gujarat, India</td>
                                    <td className="py-3 text-slate-500">2024-25</td>
                                    <td className="py-3"><span className="bg-[#FEF3C7] text-[#D97706] px-2 py-0.5 rounded-full text-[10px] font-bold">Pending</span></td>
                                    <td className="py-3 text-slate-500">18 Apr 2025</td>
                                    <td className="py-3 text-slate-500">S. Patel</td>
                                    <td className="py-3"><button className="px-3 py-1 text-[#0F766E] border border-[#0F766E]/30 rounded text-xs font-semibold hover:bg-[#0F766E]/5 transition-colors">View</button></td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="py-3 font-semibold">Plant C</td>
                                    <td className="py-3 text-slate-500">Karnataka, India</td>
                                    <td className="py-3 text-slate-500">2024-25</td>
                                    <td className="py-3"><span className="bg-[#E0F2FE] text-[#0284C7] px-2 py-0.5 rounded-full text-[10px] font-bold">Complete</span></td>
                                    <td className="py-3 text-slate-500">19 Apr 2025</td>
                                    <td className="py-3 text-slate-500">A. Singh</td>
                                    <td className="py-3"><button className="px-3 py-1 text-[#0F766E] border border-[#0F766E]/30 rounded text-xs font-semibold hover:bg-[#0F766E]/5 transition-colors">View</button></td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="py-3 font-semibold">Plant D</td>
                                    <td className="py-3 text-slate-500">Maharashtra, India</td>
                                    <td className="py-3 text-slate-500">2024-25</td>
                                    <td className="py-3"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">In Progress</span></td>
                                    <td className="py-3 text-slate-500">17 Apr 2025</td>
                                    <td className="py-3 text-slate-500">P. Venna</td>
                                    <td className="py-3"><button className="px-3 py-1 text-[#0F766E] border border-[#0F766E]/30 rounded text-xs font-semibold hover:bg-[#0F766E]/5 transition-colors">View</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold mb-4">Compliance Status</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                            <span className="font-semibold text-xs">BRSR</span>
                            <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded flex items-center gap-1 text-[10px] font-bold">
                                ✓ Compliant
                            </span>
                        </div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                            <span className="font-semibold text-xs">GHG Protocol</span>
                            <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded flex items-center gap-1 text-[10px] font-bold">
                                ✓ Compliant
                            </span>
                        </div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                            <span className="font-semibold text-xs">ISO 14064</span>
                            <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded flex items-center gap-1 text-[10px] font-bold">
                                ⌛ In Progress
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scope Details Modal */}
            {selectedScope && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/60 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="glass-card rounded-[3.5rem] w-full max-w-6xl max-h-[85vh] flex flex-col shadow-[0_40px_100px_rgba(0,0,0,0.4)] border-white/10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-12 duration-700">
                        {/* Modal Header */}
                        <div className="px-12 py-10 border-b border-border flex justify-between items-center bg-muted/20 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-premium"></div>
                            <div className="flex items-center gap-6">
                                <div className={`p-5 rounded-[1.75rem] border border-border shadow-xl ${selectedScope === 'SCOPE1' ? 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10' :
                                    selectedScope === 'SCOPE2' ? 'bg-blue-500/10 text-blue-500 shadow-blue-500/10' :
                                        'bg-orange-500/10 text-orange-500 shadow-orange-500/10'
                                    }`}>
                                    {selectedScope === 'SCOPE1' && <Factory className="w-8 h-8" />}
                                    {selectedScope === 'SCOPE2' && <Zap className="w-8 h-8" />}
                                    {selectedScope === 'SCOPE3' && <Leaf className="w-8 h-8" />}
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-4xl font-black tracking-tighter">
                                        {selectedScope.replace('SCOPE', 'Scope ')} Environmental Audit
                                    </h2>
                                    <p className="text-muted-foreground font-bold text-xs uppercase tracking-[0.2em]">Detailed Analytics & Temporal Activity Ledger</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedScope(null)}
                                className="group p-4 bg-muted/80 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-full transition-all duration-300 shadow-inner"
                            >
                                <X className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                            </button>
                        </div>

                        {scopeLoading ? (
                            <div className="p-24 flex flex-col items-center justify-center gap-6 flex-1">
                                <div className="w-12 h-12 border-[5px] border-accent/20 border-t-accent rounded-full animate-spin"></div>
                                <span className="text-muted-foreground font-black uppercase tracking-[0.2em] animate-pulse">Decompressing Intelligence...</span>
                            </div>
                        ) : scopeDetails ? (
                            <div className="overflow-y-auto flex-1 p-12 space-y-12 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="glass-card p-10 rounded-[2.5rem] bg-surface/40 hover-lift">
                                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-3">Audited Impact</p>
                                        <div className="flex items-baseline gap-3">
                                            <p className="text-6xl font-black tracking-tighter text-gradient">{scopeDetails.totalEmission.toLocaleString()}</p>
                                            <span className="text-xl font-black text-muted-foreground uppercase opacity-40">tCO2e</span>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 glass-card p-10 rounded-[2.5rem] bg-surface/40">
                                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-6">Activity Mapping by Category</p>
                                        <div className="flex flex-wrap gap-4">
                                            {scopeDetails.categoryBreakdown.map((cat: any, idx: number) => (
                                                <div key={idx} className="bg-surface/60 backdrop-blur px-6 py-4 rounded-2xl border border-border shadow-sm flex items-center gap-4 group hover:border-accent/30 transition-all">
                                                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{cat.categoryName}</span>
                                                        <span className="text-lg font-black tracking-tighter">{cat.totalEmission.toLocaleString()} t</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-black tracking-tighter flex items-center gap-3">
                                            <div className="w-2 h-8 bg-gradient-premium rounded-full"></div>
                                            Compliance Record Ledger
                                        </h3>
                                        <div className="px-4 py-2 bg-muted/50 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            Verified Records: {scopeDetails.records.length}
                                        </div>
                                    </div>

                                    <div className="glass-card rounded-[2rem] border-white/5 overflow-hidden shadow-2xl">
                                        <table className="w-full text-left">
                                            <thead className="bg-muted/80 text-muted-foreground text-[10px] uppercase font-black tracking-[0.2em]">
                                                <tr>
                                                    <th className="px-10 py-6">Temporal Node</th>
                                                    <th className="px-10 py-6">Activity Parameters</th>
                                                    <th className="px-10 py-6">Raw Quantity</th>
                                                    <th className="px-10 py-6 text-right">Computed Impact</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/30 text-sm">
                                                {scopeDetails.records.map((record: any) => (
                                                    <tr key={record.id} className="hover:bg-accent/[0.02] transition-colors group">
                                                        <td className="px-10 py-6">
                                                            <div className="flex items-center gap-3">
                                                                <Calendar className="w-4 h-4 text-muted-foreground opacity-50" />
                                                                <span className="font-bold text-muted-foreground">
                                                                    {new Date(record.recordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-6">
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-lg tracking-tight group-hover:text-accent transition-colors">{record.activityType}</span>
                                                                <span className="text-[10px] text-muted-foreground font-black tracking-widest uppercase opacity-60">{record.category}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-6">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-base font-bold">{record.activityQuantity?.toLocaleString()}</span>
                                                                <span className="text-[10px] font-black text-muted-foreground uppercase">{record.activityUnit}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-6 text-right">
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-xl font-black tracking-tighter text-accent">{record.value.toLocaleString()}</span>
                                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">tCO2e Equivalence</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {/* All Emissions Modal */}
            {isAllEmissionsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/60 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="glass-card rounded-[3.5rem] w-full max-w-6xl max-h-[85vh] flex flex-col shadow-[0_40px_100px_rgba(0,0,0,0.4)] border-white/10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-12 duration-700">
                        <div className="px-12 py-10 border-b border-border flex justify-between items-center bg-muted/20 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-premium"></div>
                            <div className="flex items-center gap-6">
                                <div className="p-5 rounded-[1.75rem] border border-border shadow-xl bg-blue-500/10 text-blue-500 shadow-blue-500/10">
                                    <Globe className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-4xl font-black tracking-tighter">Inventory Intelligence Ledger</h2>
                                    <p className="text-muted-foreground font-bold text-xs uppercase tracking-[0.2em]">Complete Audited Transaction History</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAllEmissionsModalOpen(false)}
                                className="group p-4 bg-muted/80 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-full transition-all duration-300 shadow-inner"
                            >
                                <X className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                            </button>
                        </div>

                        {scopeLoading ? (
                            <div className="p-24 flex flex-col items-center justify-center gap-6 flex-1">
                                <div className="w-12 h-12 border-[5px] border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                                <span className="text-muted-foreground font-black uppercase tracking-[0.2em] animate-pulse">Consolidating Ledger...</span>
                            </div>
                        ) : allEmissionsDetails ? (
                            <div className="overflow-y-auto flex-1 p-12 custom-scrollbar">
                                <div className="glass-card rounded-[2rem] border-white/5 overflow-hidden shadow-2xl">
                                    <table className="w-full text-left">
                                        <thead className="bg-muted/80 text-muted-foreground text-[10px] uppercase font-black tracking-[0.2em]">
                                            <tr>
                                                <th className="px-10 py-6">Audit Sequence</th>
                                                <th className="px-10 py-6">Activity Source</th>
                                                <th className="px-10 py-6">Quantification</th>
                                                <th className="px-10 py-6 text-right">Environmental Impact</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30 text-sm">
                                            {allEmissionsDetails.records.map((record: any) => (
                                                <tr key={record.id} className="hover:bg-accent/[0.02] transition-colors group">
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <Calendar className="w-4 h-4 text-muted-foreground opacity-50" />
                                                            <span className="font-bold text-muted-foreground">
                                                                {new Date(record.recordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-lg tracking-tight group-hover:text-accent transition-colors">{record.activityType}</span>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] text-muted-foreground font-black tracking-widest uppercase opacity-60">{record.category}</span>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-accent/30"></span>
                                                                <span className="text-[10px] text-accent font-black tracking-widest uppercase opacity-80">{record.scope}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-base font-bold">{record.activityQuantity?.toLocaleString()}</span>
                                                            <span className="text-[10px] font-black text-muted-foreground uppercase">{record.activityUnit}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-xl font-black tracking-tighter text-accent">{record.value.toLocaleString()}</span>
                                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">tCO2e Equivalence</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard: React.FC<{
    title: string;
    value: string;
    icon?: React.ReactNode;
    iconBg?: string;
    trend?: string;
    trendUp?: boolean;
    trendText?: string;
    trendColor?: string;
    trendBg?: string;
    sparklineColor?: string;
    onClick?: () => void;
}> = ({ title, value, icon, iconBg, trend, trendUp, trendText, trendColor, trendBg, sparklineColor, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white p-5 rounded-xl border border-slate-100 flex flex-col justify-between shadow-sm transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-200' : ''}`}
    >
        <div className="flex justify-between items-start mb-2">
            <h4 className="text-slate-500 text-xs font-semibold">{title}</h4>
            {icon && (
                <div className={`p-1.5 rounded ${iconBg}`}>
                    {icon}
                </div>
            )}
        </div>

        <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-1">
                    <p className="text-xl font-bold tracking-tight leading-none text-slate-800">{value.split(' ')[0]}</p>
                    <span className="text-[10px] font-semibold text-slate-500">{value.split(' ')[1] || ''}</span>
                </div>
                {trend && (
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className={`inline-flex items-center ${trendColor} ${trendBg} px-1 py-0.5 rounded text-[10px] font-bold`}>
                            {trendUp ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />}
                            {trend}
                        </span>
                        {trendText && <span className="text-[10px] text-slate-400">{trendText}</span>}
                    </div>
                )}
            </div>
            {sparklineColor && (
                <div className="w-12 h-8 ml-auto">
                    <svg viewBox="0 0 100 40" className={`w-full h-full fill-transparent ${sparklineColor}`} strokeWidth="3" strokeLinecap="round">
                        <path d="M0,35 L20,30 L40,35 L60,15 L80,20 L100,5" />
                    </svg>
                </div>
            )}
        </div>
    </div>
);

export default OwnerDashboardPage;
