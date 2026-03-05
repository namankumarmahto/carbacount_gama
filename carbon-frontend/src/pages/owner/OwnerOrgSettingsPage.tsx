import React from 'react';
import { ChevronDown, ChevronRight, Lock } from 'lucide-react';

const OwnerOrgSettingsPage: React.FC = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 text-slate-900 font-sans max-w-5xl">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-8">Organization Settings</h1>

            {/* Organization Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
                <h2 className="text-lg font-bold text-slate-800 mb-6">Organization Info</h2>

                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
                        <label className="text-sm font-semibold text-slate-700">Legal Company Name:</label>
                        <input
                            type="text"
                            className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-[#0F766E] focus:border-[#0F766E] p-2.5"
                            defaultValue="ABC Pvt. Ltd."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
                        <label className="text-sm font-semibold text-slate-700">Industry</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <select className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-[#0F766E] focus:border-[#0F766E] w-full p-2.5 pr-8">
                                    <option>Manufacturing</option>
                                    <option>Technology</option>
                                    <option>Healthcare</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="relative">
                                <select className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-[#0F766E] focus:border-[#0F766E] w-full p-2.5 pr-8">
                                    <option>India</option>
                                    <option>United States</option>
                                    <option>United Kingdom</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button className="px-6 py-2.5 bg-[#1a4030] text-white rounded-md text-sm font-bold hover:bg-[#133024] transition-colors shadow-sm">
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reporting Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Reporting Settings</h2>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-semibold text-slate-700 w-[140px]">Reporting Year:</label>
                            <div className="relative w-[140px]">
                                <select className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-[#0F766E] focus:border-[#0F766E] w-full p-2 pr-8">
                                    <option>2024-25</option>
                                    <option>2023-24</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="text-sm font-semibold text-slate-700 w-[140px]">Reporting Boundary:</label>
                            <div className="relative flex-1">
                                <select className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-[#0F766E] focus:border-[#0F766E] w-full p-2.5 pr-8">
                                    <option>Operational Control</option>
                                    <option>Financial Control</option>
                                    <option>Equity Share</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Advanced Settings</h2>

                    <div className="space-y-3">
                        <button className="w-full flex justify-between items-center bg-white border border-slate-200 px-4 py-3 rounded-md text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                            Transfer Ownership <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                        <button className="w-full flex justify-between items-center bg-white border border-slate-200 px-4 py-3 rounded-md text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                            Lock Reporting Year <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Danger Zone Section */}
            <div>
                <h2 className="text-lg font-medium text-slate-800 mb-4 px-1">Danger Zone</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-sm border border-slate-100 items-start">
                    {/* Left Column (Matching exact mockup anomaly) */}
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-2 rounded text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                            Transfer Ownership <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </button>
                        <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded text-sm text-slate-700 hover:bg-slate-100 transition-colors">
                            <Lock className="w-3.5 h-3.5" /> Lock Reporting Year <ChevronDown className="w-3.5 h-3.5 ml-1" />
                        </button>
                    </div>

                    {/* Right Column (Actual Danger Zone) */}
                    <div className="bg-rose-50/80 p-5 rounded-lg">
                        <h3 className="text-base font-bold text-slate-900 mb-4">Danger Zone</h3>
                        <p className="text-sm text-rose-800 mb-6">
                            Deleting your organization will permanently remove all data and cannot be undone.
                        </p>
                        <div className="flex justify-end">
                            <button className="px-5 py-2.5 bg-[#a32a2a] text-white rounded-md text-sm font-semibold hover:bg-[#852222] transition-colors shadow-sm">
                                Delete Organization
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="pb-10"></div>
        </div>
    );
};

export default OwnerOrgSettingsPage;
