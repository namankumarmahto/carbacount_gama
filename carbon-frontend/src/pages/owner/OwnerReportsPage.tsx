import React from 'react';
import { Lock, FileText, ClipboardList, FileBarChart, PieChart, Download, ChevronRight, ChevronDown } from 'lucide-react';

const ReportCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    iconBg: string;
    iconColor: string;
}> = ({ icon, title, iconBg, iconColor }) => {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}>
                    {icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            </div>

            <div className="space-y-3 mb-8 flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Last Generated:</span>
                    <span className="flex items-center gap-1 text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded cursor-pointer hover:bg-slate-200 transition-colors">
                        Draft <ChevronRight className="w-3 h-3" />
                    </span>
                </div>
                <p className="text-sm text-slate-500">
                    Last Generated: 15 Apr 2025
                </p>
            </div>

            <div className="flex items-center gap-3 mt-auto">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1a4030] text-white rounded-md text-sm font-semibold hover:bg-[#133024] transition-colors border border-transparent">
                    <FileText className="w-4 h-4" /> Generate Report
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-md text-sm font-semibold hover:bg-slate-50 border border-slate-200 transition-colors">
                    <Download className="w-4 h-4" /> Download PDF <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
            </div>
        </div>
    );
};

const OwnerReportsPage: React.FC = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 text-slate-900 font-sans max-w-6xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-800">Reports</h1>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-md text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
                    <Lock className="w-4 h-4 text-slate-400" /> Lock Reporting Year
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <ReportCard
                    icon={<FileText className="w-5 h-5" />}
                    title="ESG Report"
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-500"
                />
                <ReportCard
                    icon={<ClipboardList className="w-5 h-5" />}
                    title="BRSR Report"
                    iconBg="bg-amber-50"
                    iconColor="text-amber-500"
                />
                <ReportCard
                    icon={<FileBarChart className="w-5 h-5" />}
                    title="GHG Summary"
                    iconBg="bg-blue-50"
                    iconColor="text-blue-500"
                />
                <ReportCard
                    icon={<PieChart className="w-5 h-5" />}
                    title="Emission Statement"
                    iconBg="bg-indigo-50"
                    iconColor="text-indigo-500"
                />
            </div>

            {/* Bottom Table */}
            <div className="bg-[#f8f9fa] rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-sm font-semibold text-slate-600">Facility Name</h2>
                    <h2 className="text-sm font-semibold text-slate-600">Emissions (tCO₂e)</h2>
                </div>
                <div className="overflow-x-auto bg-white">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[13px] font-bold text-slate-800 border-b border-slate-100 bg-[#fbfbfc]">
                            <tr>
                                <th className="py-4 px-6 font-bold w-[30%]">Facility Name</th>
                                <th className="py-4 px-6 font-bold w-[30%]">Location</th>
                                <th className="py-4 px-6 font-bold w-[20%]">Reporting Year</th>
                                <th className="py-4 px-6 font-bold text-right w-[20%]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[13px] text-slate-800">
                            <tr className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-6 text-slate-600">Plant A</td>
                                <td className="py-4 px-6 text-slate-600">Odisha, India</td>
                                <td className="py-4 px-6 text-slate-600">2024-25</td>
                                <td className="py-4 px-6 text-right font-medium text-slate-600">4,875 tCO₂e</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default OwnerReportsPage;
