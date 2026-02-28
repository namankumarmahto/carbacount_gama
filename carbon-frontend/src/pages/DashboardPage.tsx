import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../api/services';
import type { DashboardData } from '../types';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import {
    TrendingDown, TrendingUp, Factory, Zap, Globe, Gauge,
    Leaf, Info, AlertCircle, BarChart as BarChartIcon
} from 'lucide-react';

const DashboardPage: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                />
                <StatCard
                    title="Scope 2 Energy"
                    value={`${data.scope2Total.toLocaleString()} t`}
                    icon={<Zap className="text-yellow-400" />}
                    trend="-1.2%"
                    trendUp={false}
                    description="Purchased electricity & heating"
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
}> = ({ title, value, icon, trend, trendUp, description }) => (
    <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl hover:border-slate-600 transition-all group">
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
