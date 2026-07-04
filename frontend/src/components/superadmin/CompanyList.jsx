import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaBuilding, FaPlus } from 'react-icons/fa';

const CompanyList = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCompanyId, setExpandedCompanyId] = useState(null);

    const fetchCompanies = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/company', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setCompanies(response.data.companies);
            }
        } catch (error) {
            console.error("Error fetching companies:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`/api/company/${id}/status`, { status }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                fetchCompanies();
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    if (loading) {
        return <div className="text-slate-400">Loading companies...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                    <FaBuilding className="text-[#6C63FF]" />
                    <span>Client Companies</span>
                </h3>
                <Link to="/superadmin-dashboard/add-company" className="bg-[#6C63FF] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-semibold transition-all">
                    <FaPlus />
                    <span>Add Company</span>
                </Link>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold">Company Name</th>
                            <th className="px-6 py-4 font-semibold">Email</th>
                            <th className="px-6 py-4 font-semibold">Plan</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                        {companies.length > 0 ? (
                            companies.map((company) => (
                                <React.Fragment key={company._id}>
                                <tr className="hover:bg-slate-800/30 transition-colors border-b border-slate-800/60">
                                    <td className="px-6 py-4 font-semibold text-white">
                                        <div className="flex flex-col">
                                            <span>{company.name}</span>
                                            <button 
                                                onClick={() => setExpandedCompanyId(expandedCompanyId === company._id ? null : company._id)}
                                                className="text-xs text-[#6C63FF] hover:text-[#4F46E5] text-left mt-1"
                                            >
                                                {expandedCompanyId === company._id ? 'Hide Details' : 'View Details'}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">{company.email}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                                            {company.subscriptionPlan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        <span className={`px-2 py-1 border rounded text-[10px] font-bold uppercase tracking-wider ${
                                            company.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            company.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        }`}>
                                            {company.status || 'pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {(!company.status || company.status === 'pending') && (
                                            <>
                                                <button 
                                                    onClick={() => updateStatus(company._id, 'approved')}
                                                    className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded border border-emerald-500/30 text-xs font-bold transition-colors"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => updateStatus(company._id, 'rejected')}
                                                    className="px-3 py-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded border border-rose-500/30 text-xs font-bold transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {company.status === 'approved' && (
                                            <span className="text-xs text-slate-500">Verified</span>
                                        )}
                                    </td>
                                </tr>
                                {expandedCompanyId === company._id && (
                                    <tr className="bg-slate-900/60 border-b border-slate-800/60">
                                        <td colSpan="5" className="px-6 py-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
                                                <div><strong className="text-slate-300">Phone:</strong> {company.phone || 'N/A'}</div>
                                                <div><strong className="text-slate-300">Address:</strong> {company.address || 'N/A'}</div>
                                                <div><strong className="text-slate-300">Joined Date:</strong> {new Date(company.createdAt).toLocaleString()}</div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                    No companies found. Click "Add Company" to register a client.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CompanyList;
