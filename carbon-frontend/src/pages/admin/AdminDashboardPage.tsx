/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../api/services';
import type { DashboardData } from '../../types';
import {
    AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Bell, Settings, ChevronDown, CheckCircle2, TrendingUp, BarChart2,
    Link2, ArrowUpCircle, Menu, CheckSquare, FileText
} from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
    const { user } = useAuth();
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
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 animate-pulse">Loading dashboard...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-red-50 text-red-600 p-8 rounded-2xl flex flex-col items-center gap-4 text-center max-w-lg mx-auto mt-12">
                <p>{error || "Failed to load"}</p>
            </div>
        );
    }

    const trendData = [
        { year: '2022-23', emissions: 6000 },
        { year: '2023-24', emissions: 11000 },
        { year: '2024-25', emissions: data.totalEmission > 0 ? data.totalEmission : 12458 },
    ];

    const pieData = [
        { name: 'Scope 1', value: data.scope1Total > 0 ? data.scope1Total : 4125, color: '#10b981' },
        { name: 'Scope 2', value: data.scope2Total > 0 ? data.scope2Total : 5320, color: '#f59e0b' },
        { name: 'Scope 3', value: data.scope3Total > 0 ? data.scope3Total : 3013, color: '#8b5cf6' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 bg-slate-50 min-h-screen text-slate-800 -mx-6 -mt-6 p-6">
            {/* Top Navigation Bar / Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                        ADMIN (ESG Manager)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {user?.industryName || 'ABC Pvt. Ltd.'} &bull; Carbon Accounting
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 border border-slate-200 bg-white rounded-md px-3 py-1.5 text-sm mr-2 shadow-sm">
                        <span className="text-slate-500">Reporting Year:</span>
                        <span className="font-semibold text-slate-700">2024-25</span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="relative cursor-pointer">
                        <Bell className="w-5 h-5 text-slate-600" />
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full border-2 border-slate-50">3</span>
                    </div>
                    <div className="cursor-pointer">
                        <Settings className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex items-center gap-2 ml-2 pl-4 border-l border-slate-200">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                            <img src="https://ui-avatars.com/api/?name=ESG+Manager&background=A7F3D0&color=065F46" alt="Profile" className="w-full h-full rounded-full" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold leading-none">ESG</span>
                            <span className="text-[10px] text-slate-500 mt-0.5 leading-none">Manager</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-2">
                <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
                <p className="text-sm text-slate-500">Overview of Carbon Emissions & Reporting</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Emissions */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-slate-600 font-semibold text-sm">Total Emissions (2024-25)</h4>
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                            <p className="text-3xl font-bold text-slate-800">{(data.totalEmission || 12458).toLocaleString()}</p>
                            <span className="text-sm font-semibold text-slate-500">tCO₂e</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-4">
                        <span className="flex items-center text-emerald-600 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 5%
                        </span>
                        <span className="text-xs text-slate-400">vs 2023-24</span>
                    </div>
                    <div className="mt-4 border-b-2 border-slate-100"></div>
                </div>

                {/* Scope 1 */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-50 p-1.5 rounded-md text-blue-500">
                                    <Link2 className="w-4 h-4" />
                                </div>
                                <h4 className="text-slate-700 font-semibold text-sm">Scope 1</h4>
                            </div>
                            <div className="bg-blue-50 p-1 rounded text-blue-500">
                                <BarChart2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1 mt-3">
                            <p className="text-2xl font-bold text-slate-800">{(data.scope1Total || 4125).toLocaleString()}</p>
                            <span className="text-sm font-semibold text-slate-500">tCO₂e</span>
                        </div>
                    </div>
                    <div className="mt-4 border-b-2 border-indigo-200"></div>
                </div>

                {/* Scope 2 */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="bg-amber-50 p-1.5 rounded-md text-amber-500">
                                    <ArrowUpCircle className="w-4 h-4" />
                                </div>
                                <h4 className="text-slate-700 font-semibold text-sm">Scope 2</h4>
                            </div>
                            <div className="bg-emerald-50 p-1 rounded text-emerald-500">
                                <CheckSquare className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1 mt-3">
                            <p className="text-2xl font-bold text-slate-800">{(data.scope2Total || 5320).toLocaleString()}</p>
                            <span className="text-sm font-semibold text-slate-500">tCO₂e</span>
                        </div>
                    </div>
                    <div className="mt-4 border-b-2 border-amber-200"></div>
                </div>

                {/* Scope 3 */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="bg-purple-50 p-1.5 rounded-md text-purple-600">
                                    <Menu className="w-4 h-4" />
                                </div>
                                <h4 className="text-slate-700 font-semibold text-sm">Scope 3</h4>
                            </div>
                            <div className="bg-purple-50 p-1 rounded text-purple-600">
                                <CheckSquare className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1 mt-3">
                            <p className="text-2xl font-bold text-slate-800">{(data.scope3Total || 3013).toLocaleString()}</p>
                            <span className="text-sm font-semibold text-slate-500">tCO₂e</span>
                        </div>
                    </div>
                    <div className="mt-4 border-b-2 border-purple-200"></div>
                </div>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Emissions Trend */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col h-[300px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-base text-slate-800">Emissions Trend (2022-25)</h3>
                        <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-xs font-bold flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" /> 5%
                        </div>
                    </div>
                    <div className="flex-1 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => val === 0 ? '0' : `${val / 1000}k`} />
                                <Tooltip />
                                <Area type="monotone" dataKey="emissions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEmissions)" activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} dot={{ r: 4, fill: '#10b981', stroke: '#10b981' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Facility-wise Emissions Table */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col h-[300px]">
                    <h3 className="font-bold text-base text-slate-800 mb-4">Facility-wise Emissions</h3>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-semibold text-slate-600 border-y border-slate-100">
                                <tr>
                                    <th className="py-2.5 px-3">Facility</th>
                                    <th className="py-2.5 px-3">Location</th>
                                    <th className="py-2.5 px-3 text-right">Emissions (tCO₂e)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm border-b border-slate-100">
                                <tr className="hover:bg-slate-50">
                                    <td className="py-3 px-3 text-slate-700">Plant A</td>
                                    <td className="py-3 px-3 text-slate-500">Odisha</td>
                                    <td className="py-3 px-3 text-right text-slate-700">4,975</td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="py-3 px-3 text-slate-700">Plant B</td>
                                    <td className="py-3 px-3 text-slate-500">Gujarat</td>
                                    <td className="py-3 px-3 text-right text-slate-700">3,210</td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="py-3 px-3 text-slate-700">Plant C</td>
                                    <td className="py-3 px-3 text-slate-500">Karnataka</td>
                                    <td className="py-3 px-3 text-right text-slate-700">2,890</td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="py-3 px-3 text-slate-700">Plant D</td>
                                    <td className="py-3 px-3 text-slate-500">Maharashtra</td>
                                    <td className="py-3 px-3 text-right text-slate-700">1,383</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-3 flex justify-end">
                        <button className="px-5 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                            View All
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Data Entry Status */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between h-[250px]">
                    <h3 className="font-bold text-base text-slate-800 mb-4">Data Entry Status</h3>
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                            <span className="text-sm font-medium w-16 text-slate-700">Scope 1</span>
                            <div className="flex-1 bg-slate-100 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                            <span className="text-xs font-bold text-emerald-700 w-10 text-right">100%</span>
                            <span className="text-[10px] text-slate-500">Completed</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-200"></div>
                            <span className="text-sm font-medium w-16 text-slate-700">Scope 2</span>
                            <div className="flex-1 bg-slate-100 rounded-full h-2">
                                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                            </div>
                            <span className="text-xs font-bold text-emerald-700 w-10 text-right">80%</span>
                            <span className="text-[10px] text-slate-500">Completed</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400"></div>
                            <span className="text-sm font-medium w-16 text-slate-700">Scope 3</span>
                            <div className="flex-1 bg-slate-100 rounded-full h-2">
                                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                            </div>
                            <span className="text-xs font-bold text-emerald-700 w-10 text-right">80%</span>
                            <span className="text-[10px] text-slate-500">Completed</span>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button className="bg-[#0F766E] hover:bg-[#0d645d] text-white px-5 py-2 rounded shadow-sm text-sm font-semibold transition-colors">
                            Go to Data Entry
                        </button>
                    </div>
                </div>

                {/* Scope Breakdown Pie Chart */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col items-center justify-center h-[250px] relative">
                    <h3 className="font-bold text-base text-slate-800 absolute top-5 left-5">Emissions by Scope</h3>
                    <div className="w-full h-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={75}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any) => `${Number(value).toLocaleString()} tCO₂e`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Reports */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col h-[250px]">
                    <h3 className="font-bold text-base text-slate-800 mb-4">Reports</h3>
                    <div className="space-y-4 flex-1 overflow-auto">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">ESG Report</span>
                            </div>
                            <button className="px-4 py-1 border border-emerald-500 text-emerald-600 rounded-full text-xs font-semibold hover:bg-emerald-50 transition-colors">
                                Generate
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-amber-50 text-amber-500 p-1.5 rounded">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">BRSR Report</span>
                            </div>
                            <button className="px-4 py-1 border border-emerald-500 text-emerald-600 rounded-full text-xs font-semibold hover:bg-emerald-50 transition-colors">
                                Generate
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-50 text-blue-500 p-1.5 rounded">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">GHG Summary</span>
                            </div>
                            <button className="px-6 py-1 border border-slate-300 text-slate-600 rounded-full text-xs font-semibold hover:bg-slate-50 transition-colors">
                                View
                            </button>
                        </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                        <button className="text-emerald-700 text-xs font-semibold flex items-center gap-1 hover:underline">
                            View All Reports <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
