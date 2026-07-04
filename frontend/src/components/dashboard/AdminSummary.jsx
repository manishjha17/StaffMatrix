import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Avatar from '../common/Avatar';
import { FaBuilding, FaUsers, FaMoneyBill, FaFileAlt, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaChartLine, FaBirthdayCake, FaUserPlus, FaCalendarAlt, FaUser, FaLock } from 'react-icons/fa'
import axios from 'axios'
import { useAuth } from '../../context/authContext'
import { useNavigate } from 'react-router-dom';

const AdminSummary = () => {
    const { user, updateUser } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState(false);
    
    // Payment Modal States
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('999');
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');

    const navigate = useNavigate();

    // Lock body scroll when payment modal is open
    useEffect(() => {
        if (showPaymentModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [showPaymentModal]);

    const handleCardNumberChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        const formatted = val.match(/.{1,4}/g)?.join(' ') || '';
        setCardNumber(formatted);
    };

    const handleExpiryChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length >= 2) {
            val = val.slice(0, 2) + '/' + val.slice(2, 4);
        }
        setCardExpiry(val);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setUpgrading(true);
        try {
            // Fake delay to simulate bank processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const token = localStorage.getItem('token');
            const res = await axios.put('/api/company/upgrade', {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.data.success) {
                updateUser({ subscriptionPlan: 'pro' });
                setShowPaymentModal(false);
                alert(`Payment of ₹${paymentAmount} processed successfully! Welcome to the Pro Plan.`);
            }
        } catch (error) {
            alert(error.response?.data?.error || "Failed to process payment and upgrade subscription.");
        } finally {
            setUpgrading(false);
        }
    };

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const summary = await axios.get('/api/dashboard/summary', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                })
                setSummary(summary.data)
            } catch (error) {
                if (error.response) {
                    alert(error.response.data.error)
                }
                console.log(error.message)
            } finally {
                setLoading(false);
            }
        }
        fetchSummary()
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-bold tracking-wide">Compiling Organization Data...</p>
            </div>
        )
    }

    if (!summary) return null;

    const { leaveSummary, recentEmployees = [], pendingLeaves = [], upcomingBirthdays = [] } = summary;
    const totalLeaves = leaveSummary.appliedFor || 1; 
    
    // Calculate percentages
    const approvedPct = Math.round((leaveSummary.approved / totalLeaves) * 100) || 0;
    const pendingPct = Math.round((leaveSummary.pending / totalLeaves) * 100) || 0;
    const rejectedPct = Math.round((leaveSummary.rejected / totalLeaves) * 100) || 0;

    return (
        <div className="space-y-6 animate-fade-in-up">
            
            {/* Dynamic Hero Section */}
            <div className="glass-panel flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl border-white/5 bg-slate-900/40 gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                
                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <FaUser className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Welcome Back,</p>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{user.name}</h1>
                    </div>
                </div>

                <div className="text-left md:text-right relative z-10 border-t border-slate-800 pt-4 md:border-0 md:pt-0">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center md:justify-end gap-1.5 mb-1">
                        <FaCalendarAlt className="text-[10px] text-cyan-400" />
                        Today's Date
                    </p>
                    <p className="text-sm font-semibold text-slate-200">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Upgrade Banner for Basic Plan */}
            {user.subscriptionPlan === 'basic' && (
                <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-cyan-500/10 p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse-glow">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div>
                        <h4 className="text-white font-extrabold text-lg flex items-center gap-2">
                            <span>🌟</span> Upgrade to SynapseHR Pro
                        </h4>
                        <p className="text-slate-400 text-xs mt-1 md:max-w-xl leading-relaxed">
                            Unlock the ability to add unlimited employees (Basic is capped at 10), manage advanced salaries, process premium payroll analytics, and remove system limitations.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowPaymentModal(true)}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-indigo-600/30 text-white font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
                    >
                        Upgrade Now
                    </button>
                </div>
            )}

            {/* Fake Payment Gateway Modal */}
            {showPaymentModal && createPortal(
                <div className="relative z-[9999]">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-[#040408] transition-opacity" aria-hidden="true" onClick={() => setShowPaymentModal(false)}></div>

                    <div className="fixed inset-0 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            {/* Modal Panel */}
                            <div className="relative w-full max-w-md transform rounded-2xl border border-slate-800 shadow-2xl shadow-black p-5 text-left align-middle transition-all space-y-4" style={{ background: '#040408' }}>
                        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500" />
                        
                        {/* Title */}
                        <div className="text-center space-y-1.5">
                            <h3 className="text-xl font-extrabold text-white flex items-center justify-center gap-2">
                                <FaLock className="text-indigo-400 text-sm animate-pulse" /> Secure Payment Gateway
                            </h3>
                            <p className="text-xs text-slate-400">Complete your transaction to activate Pro Plan</p>
                        </div>

                        {/* Credit Card Graphic */}
                        <div className="relative h-36 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-800 p-4 text-white flex flex-col justify-between shadow-lg overflow-hidden border border-white/10">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                            <div className="flex justify-between items-start">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-semibold">Pro Subscription</p>
                                    <p className="text-lg font-bold">SynapseHR</p>
                                </div>
                                <div className="text-right font-mono font-bold text-sm tracking-wide">
                                    ₹ {paymentAmount || '0'}
                                </div>
                            </div>
                            <div className="font-mono text-base tracking-widest my-2 text-center text-indigo-100">
                                {cardNumber || '•••• •••• •••• ••••'}
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="min-w-0">
                                    <p className="text-[8px] text-indigo-300 uppercase tracking-wider">Card Holder</p>
                                    <p className="text-xs font-bold uppercase truncate max-w-[150px]">{cardName || 'Your Name'}</p>
                                </div>
                                <div className="flex gap-4 text-right shrink-0">
                                    <div>
                                        <p className="text-[8px] text-indigo-300 uppercase tracking-wider">Expires</p>
                                        <p className="text-xs font-bold font-mono">{cardExpiry || 'MM/YY'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] text-indigo-300 uppercase tracking-wider">CVV</p>
                                        <p className="text-xs font-bold font-mono">{cardCvv ? '•••' : 'CVV'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Form */}
                        <form onSubmit={handlePaymentSubmit} className="space-y-3">
                            {/* Price Display — non-editable */}
                            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subscription Price</span>
                                <span className="text-sm font-extrabold text-white font-mono">₹{paymentAmount}</span>
                            </div>

                            {/* Card Holder Name */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Cardholder Name</label>
                                <input
                                    type="text"
                                    required
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                                />
                            </div>

                            {/* Card Number */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Card Number</label>
                                <input
                                    type="text"
                                    required
                                    maxLength="19"
                                    value={cardNumber}
                                    onChange={handleCardNumberChange}
                                    placeholder="4111 2222 3333 4444"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-mono"
                                />
                            </div>

                            {/* Expiry and CVV */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Expiry Date</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength="5"
                                        value={cardExpiry}
                                        onChange={handleExpiryChange}
                                        placeholder="MM/YY"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">CVV</label>
                                    <input
                                        type="password"
                                        required
                                        maxLength="3"
                                        value={cardCvv}
                                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                        placeholder="•••"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-mono"
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 py-2.5 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={upgrading}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                                >
                                    {upgrading ? (
                                        <>
                                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        `Pay ₹${paymentAmount || '0'}`
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                </div>
            </div>
            , document.body)}

            {/* Top KPIs Row */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4 hover:border-emerald-500/30 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FaUsers className="text-xl" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Employees</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{summary.totalEmployees}</h3>
                    </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4 hover:border-amber-500/30 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FaBuilding className="text-xl" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Departments</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{summary.totalDepartments}</h3>
                    </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4 hover:border-blue-500/30 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FaMoneyBill className="text-xl" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Payroll</p>
                        <h3 className="text-2xl font-bold text-white mt-1">₹ {summary.totalSalary.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4 hover:border-purple-500/30 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FaFileAlt className="text-xl" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Leaves</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{leaveSummary.appliedFor}</h3>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Action Items & Analytics */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Action Items: Pending Leaves */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <FaHourglassHalf className="text-amber-400" /> Action Items: Pending Leaves
                            </h3>
                            <button onClick={() => navigate('/admin-dashboard/leaves')} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider">
                                View All
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {pendingLeaves.length > 0 ? (
                                pendingLeaves.map(leave => (
                                    <div key={leave._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <Avatar 
                                                profileImage={leave.employeeId?.userId?.profileImage} 
                                                name={leave.employeeId?.userId?.name}
                                                className="w-10 h-10 rounded-full object-cover border border-slate-700" 
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-white">{leave.employeeId?.userId?.name || 'Unknown'}</p>
                                                <p className="text-xs text-slate-400">{leave.leaveType} • {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                                            Pending
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic">No pending leave requests at the moment.</p>
                            )}
                        </div>
                    </div>

                    {/* Leave Analytics Progress */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                            <FaChartLine className="text-indigo-400" /> Leave Analytics
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {/* Approved */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-semibold text-slate-300 flex items-center gap-2"><FaCheckCircle className="text-emerald-400"/> Approved</span>
                                    <span className="text-lg font-bold text-white">{leaveSummary.approved} <span className="text-xs text-slate-500 font-normal">({approvedPct}%)</span></span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2">
                                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${approvedPct}%` }}></div>
                                </div>
                            </div>
                            {/* Pending */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-semibold text-slate-300 flex items-center gap-2"><FaHourglassHalf className="text-amber-400"/> Pending</span>
                                    <span className="text-lg font-bold text-white">{leaveSummary.pending} <span className="text-xs text-slate-500 font-normal">({pendingPct}%)</span></span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2">
                                    <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${pendingPct}%` }}></div>
                                </div>
                            </div>
                            {/* Rejected */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-semibold text-slate-300 flex items-center gap-2"><FaTimesCircle className="text-rose-400"/> Rejected</span>
                                    <span className="text-lg font-bold text-white">{leaveSummary.rejected} <span className="text-xs text-slate-500 font-normal">({rejectedPct}%)</span></span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2">
                                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${rejectedPct}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Dynamic Lists */}
                <div className="space-y-6">
                    
                    {/* New Hires */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <FaUserPlus className="text-emerald-400" /> Recent Hires
                            </h3>
                            <button onClick={() => navigate('/admin-dashboard/employees')} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider">
                                All
                            </button>
                        </div>
                        <div className="space-y-4">
                            {recentEmployees.length > 0 ? (
                                recentEmployees.map(emp => (
                                    <div key={emp._id} className="flex items-center gap-3">
                                        <Avatar 
                                            profileImage={emp.userId?.profileImage} 
                                            name={emp.userId?.name}
                                            className="w-8 h-8 rounded-full object-cover border border-slate-700" 
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-white">{emp.userId?.name || 'Unknown'}</p>
                                            <p className="text-xs text-slate-400">{emp.department?.dep_name || 'N/A'}</p>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-500">{new Date(emp.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic">No recent hires.</p>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Birthdays */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 relative z-10">
                            <FaBirthdayCake className="text-purple-400" /> Upcoming Birthdays
                        </h3>
                        <div className="space-y-4 relative z-10">
                            {upcomingBirthdays.length > 0 ? (
                                upcomingBirthdays.map(emp => {
                                    const dob = new Date(emp.dob);
                                    return (
                                        <div key={emp._id} className="flex items-center gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                                            <Avatar 
                                                profileImage={emp.userId?.profileImage} 
                                                name={emp.userId?.name}
                                                className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0" 
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-white">{emp.userId?.name || 'Unknown'}</p>
                                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                                    <FaCalendarAlt className="text-[10px]" /> {dob.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="text-sm text-slate-400 italic">No birthdays in the next 30 days.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default AdminSummary