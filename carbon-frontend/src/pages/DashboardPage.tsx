import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../api/services';
import type { DashboardData } from '../types';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import {
    TrendingDown, TrendingUp, Factory, Zap, Globe, Gauge,
    Leaf, Info, AlertCircle, BarChart as BarChartIcon, X, Calendar
} from 'lucide-react';
import type { ScopeDashboardResponse } from '../types';

const DashboardPage: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedScope, setSelectedScope] = useState<string | null>(null);
    const [scopeDetails, setScopeDetails] = useState<ScopeDashboardResponse | null>(null);
    const [scopeLoading, setScopeLoading] = useState(false);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await dashboardApi.getDashboard();
                if (response.data.success) {
                    setData(response.data.data);
                } else {
                    setError(response.data.message);
                }
            } catch (err: any) {
                setError('Failed to load dashboard data. Please try again later.');
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
            <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-2xl flex flex-col items-center gap-4 text-center max-w-lg mx-auto mt-12">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <div>
                    <h2 className="text-xl font-bold text-white mb-1">Data Connection Failure</h2>
                    <p className="text-slate-400">{error || "Could not retrieve analytical data."}</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-lg transition-colors"
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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Environmental Dashboard</h1>
                    <p className="text-slate-400 mt-1">Real-time carbon footprint monitoring and intelligence</p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    <span className="text-sm font-medium text-slate-300">Live Telemetry Active</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Emissions"
                    value={`${data.totalEmission.toLocaleString()} tCO2e`}
                    icon={<Globe className="text-blue-400" />}
                    trend="-2.4%"
                    trendUp={false}
                    description="Gross footprint across all scopes"
                />
                <StatCard
                    title="Carbon Intensity"
                    value={`${data.carbonIntensity.toFixed(3)}`}
                    icon={<Gauge className="text-green-400" />}
                    trend="+0.5%"
                    trendUp={true}
                    description="CO2e per unit of production"
                />
                <StatCard
                    title="Scope 1 Direct"
                    value={`${data.scope1Total.toLocaleString()} t`}
                    icon={<Factory className="text-emerald-400" />}
                    trend="-5.1%"
                    trendUp={false}
                    description="Stationary & mobile combustion"
                    onClick={() => handleScopeClick('SCOPE1')}
                />
                <StatCard
                    title="Scope 2 Energy"
                    value={`${data.scope2Total.toLocaleString()} t`}
                    icon={<Zap className="text-yellow-400" />}
                    trend="-1.2%"
                    trendUp={false}
                    description="Purchased electricity & heating"
                    onClick={() => handleScopeClick('SCOPE2')}
                />
                <StatCard
                    title="Scope 3 Indirect"
                    value={`${data.scope3Total.toLocaleString()} t`}
                    icon={<Leaf className="text-orange-400" />}
                    trend="+2.1%"
                    trendUp={true}
                    description="Value chain emissions"
                    onClick={() => handleScopeClick('SCOPE3')}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trend Chart */}
                <div className="lg:col-span-2 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-green-500" />
                            Monthly Emission Trend
                        </h3>
                        <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-sm outline-none focus:border-green-500">
                            <option>Last 6 Months</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.monthlyTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}t`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                                    itemStyle={{ color: '#10b981' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="emission"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    dot={{ fill: '#10b981', r: 4 }}
                                    activeDot={{ r: 8, stroke: '#0f172a', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Breakdown Chart */}
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 shadow-xl flex flex-col">
                    <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-emerald-500" />
                        Scope Distribution
                    </h3>
                    <div className="flex-1 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                                />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Info className="w-3 h-3 text-blue-400" />
                            <span>Scope 1 accounts for <b>{data.totalEmission > 0 ? ((data.scope1Total / data.totalEmission) * 100).toFixed(1) : 0}%</b> of your footprint.</span>
                        </div>
                    </div>
                </div>

                {/* Category Breakdown List */}
                <div className="lg:col-span-3 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <BarChart className="w-5 h-5 text-purple-500" />
                        Category Breakdown
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
                            data.categoryBreakdown.map((cat, i) => (
                                <div key={i} className="bg-slate-900/50 border border-slate-700 p-4 rounded-xl flex justify-between items-center group hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                        <span className="text-slate-300 font-medium">{cat.categoryName}</span>
                                    </div>
                                    <span className="text-white font-bold">{cat.totalEmission.toLocaleString()} tCO2e</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 text-sm">No categorical data available.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Scope Details Modal */}
            {selectedScope && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/40">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    {selectedScope === 'SCOPE1' && <Factory className="text-emerald-500" />}
                                    {selectedScope === 'SCOPE2' && <Zap className="text-blue-500" />}
                                    {selectedScope === 'SCOPE3' && <Leaf className="text-orange-500" />}
                                    {selectedScope.replace('SCOPE', 'Scope ')} Detailed View
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Deep dive into recorded emissions</p>
                            </div>
                            <button
                                onClick={() => setSelectedScope(null)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {scopeLoading ? (
                            <div className="p-12 flex flex-col items-center justify-center gap-4 flex-1">
                                <div className="w-8 h-8 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
                                <span className="text-slate-400">Loading records...</span>
                            </div>
                        ) : scopeDetails ? (
                            <div className="overflow-y-auto flex-1 p-8 space-y-8 custom-scrollbar">
                                {/* Details Top row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                                        <p className="text-slate-400 text-sm font-medium mb-1">Total {selectedScope.replace('SCOPE', 'Scope ')} Emission</p>
                                        <p className="text-3xl font-bold text-white">{scopeDetails.totalEmission.toLocaleString()} <span className="text-lg text-slate-500">tCO2e</span></p>
                                    </div>
                                    <div className="md:col-span-2 bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                                        <p className="text-slate-400 text-sm font-medium mb-3">Category Breakdown</p>
                                        <div className="space-y-3">
                                            {scopeDetails.categoryBreakdown.map((cat, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                        <span className="text-slate-300">{cat.categoryName}</span>
                                                    </div>
                                                    <span className="text-white font-medium">{cat.totalEmission.toLocaleString()} t</span>
                                                </div>
                                            ))}
                                            {scopeDetails.categoryBreakdown.length === 0 && (
                                                <span className="text-slate-500">No categories found in this scope.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Records Table */}
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-slate-400" />
                                        Individual Records
                                    </h3>
                                    <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4 font-medium">Date</th>
                                                    <th className="px-6 py-4 font-medium">Category</th>
                                                    <th className="px-6 py-4 font-medium text-right">Value (tCO2e)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700/50 text-sm">
                                                {scopeDetails.records.map((record) => (
                                                    <tr key={record.id} className="hover:bg-slate-800/50 transition-colors">
                                                        <td className="px-6 py-4 text-slate-300">
                                                            {new Date(record.recordedAt).toLocaleDateString(undefined, {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs font-medium border border-slate-600">
                                                                {record.category}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-white font-mono font-medium">
                                                            {record.value.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {scopeDetails.records.length === 0 && (
                                                    <tr>
                                                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                                            No emission records found for this scope.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-red-400 flex-1 flex flex-col justify-center items-center">
                                <AlertCircle className="w-8 h-8 mb-2" />
                                Failed to load scope details.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ReactNode;
    trend: string;
    trendUp: boolean;
    description: string;
    onClick?: () => void;
}> = ({ title, value, icon, trend, trendUp, description, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl transition-all group ${onClick ? 'cursor-pointer hover:border-green-500/50 hover:bg-slate-800/80 hover:scale-[1.02] shadow-sm hover:shadow-green-500/10' : 'hover:border-slate-600'}`}
    >
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 group-hover:bg-slate-800 transition-colors">
                {icon}
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                {trend}
            </span>
        </div>
        <div className="space-y-1">
            <h4 className="text-slate-400 text-sm font-medium">{title}</h4>
            <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-2">{description}</p>
        </div>
    </div>
);

export default DashboardPage;
