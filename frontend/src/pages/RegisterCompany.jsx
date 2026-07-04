import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaBuilding, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

const RegisterCompany = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const plan = queryParams.get('plan');
        if (plan === 'basic' || plan === 'pro') {
            setFormData(prev => ({ ...prev, subscriptionPlan: plan }));
        }
    }, [location.search]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/company/register', formData);
            if (response.data.success) {
                setSuccess(true);
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setError(error.response.data.error);
            } else {
                setError("Server error. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 space-y-6">
                <div className="glass-panel p-8 md:p-12 rounded-3xl max-w-xl w-full text-center space-y-6 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                        <FaCheckCircle className="text-4xl text-emerald-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">Registration Successful!</h2>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Your company account has been created and is currently <span className="text-[#22D3EE] font-bold">under verification</span>. 
                            Our Superadmin team will review your details shortly. Once approved, you will be able to log in using your admin credentials.
                        </p>
                    </div>
                    <div className="pt-4">
                        <Link to="/" className="inline-block px-8 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold hover:bg-slate-800 transition-colors text-sm">
                            Return to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                <Link to="/" className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold">
                    <FaArrowLeft />
                    <span>Back to Home</span>
                </Link>

                <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-3xl font-extrabold text-white flex items-center justify-center md:justify-start space-x-3">
                        <FaBuilding className="text-[#6C63FF]" />
                        <span>Register Your Company</span>
                    </h3>
                    <p className="text-sm text-slate-400">Join SynapseHR today. Fill out your details below to get started.</p>
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold text-center animate-fade-in">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 md:p-10 space-y-8 shadow-2xl backdrop-blur-md">
                    
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-[#22D3EE] uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-full bg-[#22D3EE]/10 flex items-center justify-center text-[#22D3EE] text-xs">1</span>
                            <span>Company Details</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 text-sm transition-all focus:bg-slate-950"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                    <span>Company Email</span>
                                    <span className="text-[9px] text-[#6C63FF] font-bold lowercase tracking-normal bg-[#6C63FF]/10 px-2 py-0.5 rounded-full border border-[#6C63FF]/20">Used for login</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 text-sm transition-all focus:bg-slate-950"
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
                                    className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 text-sm transition-all focus:bg-slate-950"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subscription Plan</label>
                                <div className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-sm font-semibold flex items-center justify-between">
                                    <span>
                                        {formData.subscriptionPlan === 'pro' ? 'Pro Plan (₹999/month)' : 'Basic Plan (Free)'}
                                    </span>
                                    <FaCheckCircle className="text-emerald-500 text-lg" />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 text-sm transition-all focus:bg-slate-950"
                                    rows="2"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4">
                        <h4 className="text-sm font-bold text-[#6C63FF] uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-full bg-[#6C63FF]/10 flex items-center justify-center text-[#6C63FF] text-xs">2</span>
                            <span>Root Admin Account</span>
                        </h4>
                        <p className="text-xs text-slate-400 -mt-3 mb-4">This will be the primary login account for managing your company.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin Name</label>
                                <input
                                    type="text"
                                    name="adminName"
                                    value={formData.adminName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/50 text-sm transition-all focus:bg-slate-950"
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
                                    className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/50 text-sm transition-all focus:bg-slate-950"
                                />
                            </div>
                        </div>
                    </div>

                    {formData.subscriptionPlan === 'pro' && (
                        <div className="p-4 rounded-xl bg-gradient-to-r from-[#6C63FF]/10 to-transparent border-l-4 border-[#6C63FF] text-slate-300 text-xs leading-relaxed animate-fade-in">
                            <strong className="text-[#d8b4fe]">Pro Plan Selected:</strong> Your payment of ₹999 has been successfully processed! 
                            After registration, your account will be sent to the Superadmin for verification and approval.
                        </div>
                    )}

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-between border-t border-slate-800">
                        <p className="text-xs text-slate-500 mb-4 sm:mb-0">
                            By registering, you agree to our Terms of Service.
                        </p>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-[#6C63FF] to-[#4F46E5] text-white font-bold rounded-xl shadow-lg shadow-[#6C63FF]/20 hover:shadow-[#6C63FF]/40 transition-all active:scale-[0.98] text-sm flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <span>Submit Registration</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Background elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#6C63FF] rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-blob"></div>
                <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-[#22D3EE] rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[40%] bg-[#a855f7] rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>
        </div>
    );
};

export default RegisterCompany;
