import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

const AddCompany = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        subscriptionPlan: 'basic',
        adminName: '',
        adminPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/company/add', formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                navigate('/superadmin-dashboard');
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setError(error.response.data.error);
            } else {
                setError("Server error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                <FaBuilding className="text-[#6C63FF]" />
                <span>Add New Company</span>
            </h3>

            {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-sm">
                
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#22D3EE] uppercase tracking-wider border-b border-slate-800 pb-2">Company Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 text-sm"
                                placeholder="Acme Corp"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company/Admin Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 text-sm"
                                placeholder="admin@acmecorp.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                pattern="^\+?[0-9\s\-]{7,15}$"
                                title="Please enter a valid phone number (digits, spaces, hyphens, and optional + prefix). Example: +1 555-1234"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 text-sm"
                                placeholder="+1 555-1234"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subscription Plan</label>
                            <select
                                name="subscriptionPlan"
                                value={formData.subscriptionPlan}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 text-sm"
                            >
                                <option value="basic">Basic Plan</option>
                                <option value="pro">Pro Plan</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 text-sm"
                                placeholder="123 Business Rd"
                                rows="2"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <h4 className="text-sm font-bold text-[#6C63FF] uppercase tracking-wider border-b border-slate-800 pb-2">Root Admin Account</h4>
                    <p className="text-xs text-slate-400">This will be the first login account for the company admin.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin Name</label>
                            <input
                                type="text"
                                name="adminName"
                                value={formData.adminName}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/50 text-sm"
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin Password</label>
                            <input
                                type="password"
                                name="adminPassword"
                                value={formData.adminPassword}
                                onChange={handleChange}
                                required
                                minLength="8"
                                title="Password must be at least 8 characters long"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/50 text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-[#6C63FF] to-[#4F46E5] text-white font-bold rounded-xl shadow-lg hover:shadow-[#6C63FF]/30 transition-all active:scale-[0.98] text-sm flex items-center justify-center"
                    >
                        {loading ? 'Creating...' : 'Create Company & Admin'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddCompany;
