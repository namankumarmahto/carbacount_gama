import React from 'react';
import { Settings2, Calendar, ChevronDown, ChevronRight, ChevronLeft, ChevronsRight } from 'lucide-react';

const OwnerAuditLogsPage: React.FC = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 text-slate-900 font-sans">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-8">Audit Logs</h1>

            {/* Main Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden outline outline-1 outline-slate-100 flex flex-col">

                {/* Filters */}
                <div className="p-6 border-b border-slate-100 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Settings2 className="w-5 h-5 text-slate-500" />
                                <span className="text-sm font-semibold text-slate-700">Date:</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700">
                                <Calendar className="w-4 h-4 text-[#0F766E]" />
                                04/05/2024 – 04/20/2024
                            </div>
                            <div className="relative">
                                <select className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-[#0F766E] focus:border-[#0F766E] w-[80px] py-1.5 px-3 pr-8">
                                    <option>All</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <button className="px-5 py-2 bg-[#1a4030] text-white rounded-md text-sm font-medium hover:bg-[#133024] transition-colors shadow-sm">
                            Clear Filters
                        </button>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <span className="text-sm font-semibold text-slate-700">User:</span>
                        <div className="relative">
                            <select className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-[#0F766E] focus:border-[#0F766E] w-[180px] py-1.5 px-3 pr-8">
                                <option>All</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[14px] font-semibold text-slate-600 border-b border-slate-100 bg-white">
                            <tr>
                                <th className="py-4 px-6 font-semibold w-[20%]">User</th>
                                <th className="py-4 px-6 font-semibold w-[30%]">Action</th>
                                <th className="py-4 px-6 font-semibold w-[25%]">Module</th>
                                <th className="py-4 px-6 font-semibold w-[25%]">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[13px] text-slate-800">
                            <tr className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-6 font-medium text-slate-800">A. Kumar</td>
                                <td className="py-4 px-6 text-slate-600">Added facility Plant B</td>
                                <td className="py-4 px-6">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-[#1a4030] text-white">
                                        Facility
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-slate-600">04/20/2025, 9:27 PM</td>
                            </tr>
                            <tr className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-6 font-medium text-slate-800">R. Mehta</td>
                                <td className="py-4 px-6 text-slate-600">Updated data Scope 1</td>
                                <td className="py-4 px-6">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 cursor-pointer">
                                        Scope 1 <ChevronRight className="w-3 h-3" />
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-slate-600">04/20/2025, 8:11 PM</td>
                            </tr>
                            <tr className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-6 font-medium text-slate-800">S. Patel</td>
                                <td className="py-4 px-6 text-slate-600">Exported report Emissions</td>
                                <td className="py-4 px-6">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-700 cursor-pointer">
                                        Emissions <ChevronRight className="w-3 h-3" />
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-slate-600">04/19/2025, 7:45 PM</td>
                            </tr>
                            <tr className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-6 font-medium text-slate-800">A. Singh</td>
                                <td className="py-4 px-6 text-slate-600">Invited user To organization</td>
                                <td className="py-4 px-6">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-purple-50 text-purple-700 cursor-pointer">
                                        Organization <ChevronRight className="w-3 h-3" />
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-slate-600">04/18/2025, 6:30 PM</td>
                            </tr>
                            <tr className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-6 font-medium text-slate-800">P. Verma</td>
                                <td className="py-4 px-6 text-slate-600">Generated report Emissions</td>
                                <td className="py-4 px-6">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 cursor-pointer">
                                        Emissions <ChevronRight className="w-3 h-3" />
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-slate-600">04/17/2025, 5:10 PM</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Inner pagination string */}
                <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-50 bg-[#fafafa]">
                    <span className="text-sm text-slate-500">Showing 1 to 5 out of 55 entries</span>
                    <button className="p-1 rounded bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
                        <ChevronLeft className="w-4 h-4 opacity-50" />
                    </button>
                    <button className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Bottom Pagination */}
            <div className="flex justify-end pt-4">
                <div className="flex items-center gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1a4030] text-white text-sm font-semibold transition-colors">
                        1
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-sm font-medium transition-colors">
                        2
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-sm font-medium transition-colors">
                        3
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-sm font-medium transition-colors">
                        4
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm tracking-widest">
                        ...
                    </span>
                    <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-sm font-medium transition-colors">
                        11
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 transition-colors">
                        <ChevronsRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="pb-10"></div>
        </div>
    );
};

export default OwnerAuditLogsPage;
