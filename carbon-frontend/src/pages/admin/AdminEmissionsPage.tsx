import React from 'react';
import { Download, Calendar, Building2, Layers, BarChart2, TrendingUp, ArrowUp } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const barData = [
    { year: '2022-23', emissions: 6500, fill: '#3b82f6' },
    { year: '2023-24', emissions: 11000, fill: '#0f766e' },
    { year: '2024-25', emissions: 8500, fill: '#4ade80' },
];

const pieData = [
    { name: 'Scope 1', value: 4125, fill: '#3b82f6' },
    { name: 'Scope 2', value: 5320, fill: '#f59e0b' },
    { name: 'Scope 3', value: 3013, fill: '#8b5cf6' },
    { name: 'Other', value: 2500, fill: '#0f766e' } // To match the 4 colored sections in image
];

const AdminEmissionsPage: React.FC = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 text-slate-900 font-sans">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-slate-800">Emissions</h1>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0F766E] text-white rounded-md text-sm font-semibold hover:bg-[#0d645d] transition-colors shadow-sm">
                    <Download className="w-4 h-4" /> Export Data
                </button>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden outline outline-1 outline-slate-100 p-6">

                {/* Filters */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-slate-600">Reporting Year:</span>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-700">
                                <Calendar className="w-4 h-4 text-emerald-600" />
                                2024-25
                                <span className="ml-1 text-slate-400">▼</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-700">
                            <Building2 className="w-4 h-4 text-slate-500" />
                            All Facilities
                            <span className="ml-1 text-slate-400">▼</span>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-700">
                            <Layers className="w-4 h-4 text-slate-500" />
                            Scope: All
                            <span className="ml-1 text-slate-400">▼</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 bg-slate-100 rounded text-slate-700 hover:bg-slate-200 transition-colors">
                            <BarChart2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-white border border-slate-200 rounded text-slate-400 hover:bg-slate-50 transition-colors">
                            <TrendingUp className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-4">

                    {/* Bar Chart */}
                    <div className="relative">
                        <h2 className="text-lg font-bold text-slate-800 mb-6">Annual Emissions Over Time</h2>

                        <div className="absolute top-0 right-0 flex items-center gap-1 text-emerald-600 font-bold">
                            <ArrowUp className="w-4 h-4" />
                            <span>5%</span>
                            <span className="text-slate-500 font-medium ml-1">vs 2023-24</span>
                        </div>

                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="year"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        tickFormatter={(val) => `${val / 1000}k`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="emissions" radius={[2, 2, 0, 0]} barSize={40}>
                                        {barData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Donut Chart */}
                    <div className="border-l border-slate-100 pl-8">
                        <h2 className="text-lg font-bold text-slate-800 mb-6">Scope Breakdown</h2>

                        <div className="flex items-center h-[250px]">
                            <div className="w-[60%] h-full relative border-r border-slate-100 pr-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={95}
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2 pr-4">
                                    <span className="text-2xl font-black text-slate-800">12,458</span>
                                    <span className="text-xs font-semibold text-slate-500">tCO₂e</span>
                                </div>
                            </div>

                            <div className="w-[40%] pl-6 flex flex-col gap-5 justify-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                                        <span className="text-sm font-semibold text-slate-700">Scope 1</span>
                                    </div>
                                    <p className="text-xs text-slate-500 ml-5">
                                        <span className="font-bold text-slate-800">4,125</span> tCO₂e
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                                        <span className="text-sm font-semibold text-slate-700">Scope 2</span>
                                    </div>
                                    <p className="text-xs text-slate-500 ml-5">
                                        <span className="font-bold text-slate-800">5,320</span> tCO₂e
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div>
                                        <span className="text-sm font-semibold text-slate-700">Scope 3</span>
                                    </div>
                                    <p className="text-xs text-slate-500 ml-5">
                                        <span className="font-bold text-slate-800">3,013</span> tCO₂e
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Table */}
            <div className="bg-[#f8f9fa] rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 bg-white border-b border-slate-200">
                    <h2 className="text-base font-bold text-slate-800">Facility Comparison</h2>
                </div>
                <div className="overflow-x-auto bg-white">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[13px] font-semibold text-slate-600 border-b border-slate-100 bg-[#fbfbfc]">
                            <tr>
                                <th className="py-4 px-6 font-semibold">Facility Name</th>
                                <th className="py-4 px-6 font-semibold">Location</th>
                                <th className="py-4 px-6 font-semibold text-center">Reporting Year</th>
                                <th className="py-4 px-6 font-semibold text-right">Emissions (tCO₂e)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[13px] text-slate-800">
                            <tr className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-6 font-semibold">Plant A</td>
                                <td className="py-4 px-6 text-slate-600">Odisha, India</td>
                                <td className="py-4 px-6 text-center text-slate-600">2024-25</td>
                                <td className="py-4 px-6 text-right font-medium">4,975 tCO₂e</td>
                            </tr>
                            {/* Can add more rows artificially to fill out the table if needed, but going off the exact screenshot: */}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default AdminEmissionsPage;
