import React from 'react';
import { Pencil, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminFacilitiesPage: React.FC = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 text-slate-900 font-sans">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-slate-800">Facilities</h1>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0F766E] text-white rounded-md text-sm font-semibold hover:bg-[#0d645d] transition-colors shadow-sm">
                    <span className="text-lg leading-none">+</span> Add Facility <ChevronDown className="w-4 h-4 ml-1" />
                </button>
            </div>

            {/* Table 1 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden outline outline-1 outline-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[13px] font-semibold text-slate-600 border-b border-slate-100 bg-white">
                            <tr>
                                <th className="py-4 px-6 font-semibold">Facility Name</th>
                                <th className="py-4 px-6 font-semibold">Country</th>
                                <th className="py-4 px-6 font-semibold">State</th>
                                <th className="py-4 px-6 font-semibold">Production Capacity</th>
                                <th className="py-4 px-6 font-semibold">Assigned Users</th>
                                <th className="py-4 px-6 font-semibold">Status</th>
                                <th className="py-4 px-6 font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[13px] text-slate-800">
                            <tr className="hover:bg-slate-50">
                                <td className="py-4 px-6 font-semibold">Plant A</td>
                                <td className="py-4 px-6">Odisha, India</td>
                                <td className="py-4 px-6">India</td>
                                <td className="py-4 px-6 font-semibold">
                                    50,000 <span className="font-normal text-slate-500">metric tons/yr</span>
                                </td>
                                <td className="py-4 px-6 hover:underline cursor-pointer">R. Mehta</td>
                                <td className="py-4 px-6">
                                    <button className="flex items-center gap-1.5 px-3 py-1 text-sm font-semibold text-[#10B981] bg-emerald-50 border border-emerald-200/60 rounded hover:bg-emerald-100 transition-colors">
                                        <Pencil className="w-3 h-3" /> Edit
                                    </button>
                                </td>
                                <td className="py-4 px-6">
                                    <button className="px-3 py-1 text-sm font-semibold text-rose-500 bg-rose-50 border border-rose-200/60 rounded hover:bg-rose-100 transition-colors">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="py-4 px-6 font-semibold">Plant B</td>
                                <td className="py-4 px-6">Gujarat, India</td>
                                <td className="py-4 px-6">India</td>
                                <td className="py-4 px-6 font-semibold">
                                    30,000 <span className="font-normal text-slate-500">metric tons/yr</span>
                                </td>
                                <td className="py-4 px-6 hover:underline cursor-pointer">S. Patel</td>
                                <td className="py-4 px-6">
                                    <span className="inline-block px-3 py-1 text-sm font-semibold text-amber-600 bg-amber-50 rounded">
                                        Pending
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <button className="px-3 py-1 text-sm font-semibold text-rose-500 bg-rose-50 border border-rose-200/60 rounded hover:bg-rose-100 transition-colors">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="py-4 px-6 font-semibold">Plant C</td>
                                <td className="py-4 px-6">Karnataka, India</td>
                                <td className="py-4 px-6">India</td>
                                <td className="py-4 px-6 font-semibold">
                                    100,000 <span className="font-normal text-slate-500">metric tons/yr</span>
                                </td>
                                <td className="py-4 px-6 hover:underline cursor-pointer">A. Singh</td>
                                <td className="py-4 px-6">
                                    <button className="flex items-center gap-1.5 px-3 py-1 text-sm font-semibold text-[#10B981] bg-emerald-50 border border-emerald-200/60 rounded hover:bg-emerald-100 transition-colors">
                                        <Pencil className="w-3 h-3" /> Edit
                                    </button>
                                </td>
                                <td className="py-4 px-6">
                                    <button className="px-3 py-1 text-sm font-semibold text-rose-500 bg-rose-50 border border-rose-200/60 rounded hover:bg-rose-100 transition-colors">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="py-4 px-6 font-semibold">Plant D</td>
                                <td className="py-4 px-6">Maharashtra, India</td>
                                <td className="py-4 px-6">India</td>
                                <td className="py-4 px-6 font-semibold">
                                    20,000 <span className="font-normal text-slate-500">metric tons/yr</span>
                                </td>
                                <td className="py-4 px-6 hover:underline cursor-pointer">P. Verma</td>
                                <td className="py-4 px-6">
                                    <button className="flex items-center gap-1.5 px-3 py-1 text-sm font-semibold text-[#4F46E5] bg-indigo-50 border border-indigo-200/60 rounded hover:bg-indigo-100 transition-colors">
                                        <Pencil className="w-3 h-3" /> Edit
                                    </button>
                                </td>
                                <td className="py-4 px-6">
                                    <button className="px-3 py-1 text-sm font-semibold text-rose-500 bg-rose-50 border border-rose-200/60 rounded hover:bg-rose-100 transition-colors">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 flex items-center justify-end gap-4 border-t border-slate-50 bg-white">
                    <span className="text-sm text-slate-500">Showing 4 out of 4 facilities</span>
                    <div className="flex gap-2">
                        <button className="p-1 rounded border border-slate-200 text-slate-400 hover:bg-slate-50" disabled>
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="p-1 rounded border border-slate-200 text-slate-400 hover:bg-slate-50" disabled>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table 2 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden outline outline-1 outline-slate-100 mt-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[13px] font-semibold text-slate-600 border-b border-slate-100 bg-white">
                            <tr>
                                <th className="py-4 px-6 font-semibold">Facility Name</th>
                                <th className="py-4 px-6 font-semibold">Country</th>
                                <th className="py-4 px-6 font-semibold">State</th>
                                <th className="py-4 px-6 font-semibold">Production Capacity</th>
                                <th className="py-4 px-6 font-semibold">Assigned Users</th>
                                <th className="py-4 px-6 font-semibold">Status</th>
                                <th className="py-4 px-6 font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[13px] text-slate-800">
                            <tr className="hover:bg-slate-50">
                                <td className="py-4 px-6 font-semibold">Plant A</td>
                                <td className="py-4 px-6">Odisha, India</td>
                                <td className="py-4 px-6">India</td>
                                <td className="py-4 px-6 font-semibold">
                                    50,000 <span className="font-normal text-slate-500">metric tons/yr</span>
                                </td>
                                <td className="py-4 px-6 hover:underline cursor-pointer">R. Mehta</td>
                                <td className="py-4 px-6">
                                    <button className="flex items-center gap-1.5 px-3 py-1 text-sm font-semibold text-[#10B981] bg-emerald-50 border border-emerald-200/60 rounded hover:bg-emerald-100 transition-colors">
                                        <Pencil className="w-3 h-3" /> Edit
                                    </button>
                                </td>
                                <td className="py-4 px-6">
                                    <button className="px-3 py-1 text-sm font-semibold text-rose-500 bg-rose-50 border border-rose-200/60 rounded hover:bg-rose-100 transition-colors">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="py-4 px-6 font-semibold">Plant B</td>
                                <td className="py-4 px-6">Gujarat, India</td>
                                <td className="py-4 px-6">India</td>
                                <td className="py-4 px-6 font-semibold">
                                    30,000 <span className="font-normal text-slate-500">metric tons/yr</span>
                                </td>
                                <td className="py-4 px-6 hover:underline cursor-pointer">S. Patel</td>
                                <td className="py-4 px-6">
                                    <button className="flex items-center gap-1.5 px-3 py-1 text-sm font-semibold text-[#10B981] bg-emerald-50 border border-emerald-200/60 rounded hover:bg-emerald-100 transition-colors">
                                        <Pencil className="w-3 h-3" /> Edit
                                    </button>
                                </td>
                                <td className="py-4 px-6">
                                    <button className="px-3 py-1 text-sm font-semibold text-rose-500 bg-rose-50 border border-rose-200/60 rounded hover:bg-rose-100 transition-colors">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="py-4 px-6 font-semibold">Plant C</td>
                                <td className="py-4 px-6">Karnataka, India</td>
                                <td className="py-4 px-6">India</td>
                                <td className="py-4 px-6 font-semibold">
                                    100,000 <span className="font-normal text-slate-500">metric tons/yr</span>
                                </td>
                                <td className="py-4 px-6 hover:underline cursor-pointer">A. Singh</td>
                                <td className="py-4 px-6">
                                    <button className="flex items-center gap-1.5 px-3 py-1 text-sm font-semibold text-[#10B981] bg-emerald-50 border border-emerald-200/60 rounded hover:bg-emerald-100 transition-colors">
                                        <Pencil className="w-3 h-3" /> Edit
                                    </button>
                                </td>
                                <td className="py-4 px-6">
                                    <button className="px-3 py-1 text-sm font-semibold text-rose-500 bg-rose-50 border border-rose-200/60 rounded hover:bg-rose-100 transition-colors">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="py-4 px-6 font-semibold">Plant D</td>
                                <td className="py-4 px-6">Maharashtra, India</td>
                                <td className="py-4 px-6">India</td>
                                <td className="py-4 px-6 font-semibold">
                                    20,000 <span className="font-normal text-slate-500">metric tons/yr</span>
                                </td>
                                <td className="py-4 px-6 hover:underline cursor-pointer">P. Verma</td>
                                <td className="py-4 px-6" colSpan={2}>
                                    <button className="flex items-center justify-between gap-1.5 px-3 py-1 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded hover:bg-indigo-200 transition-colors w-[150px]">
                                        <div className="flex items-center gap-1.5">
                                            <Pencil className="w-3 h-3" /> In Progress
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 flex items-center justify-end gap-4 border-t border-slate-50 bg-white">
                    <span className="text-sm text-slate-500">Showing 4 out of 4 facilities</span>
                    <div className="flex gap-2">
                        <button className="p-1 rounded border border-slate-200 text-slate-400 hover:bg-slate-50" disabled>
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="p-1 rounded border border-slate-200 text-slate-400 hover:bg-slate-50" disabled>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminFacilitiesPage;
