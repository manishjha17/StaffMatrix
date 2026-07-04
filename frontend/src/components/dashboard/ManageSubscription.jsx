import React, { useState } from 'react';
import { useAuth } from '../../context/authContext';
import { FaCheckCircle, FaStar, FaCrown, FaTimesCircle, FaArrowRight, FaLock } from 'react-icons/fa';
import { createPortal } from 'react-dom';
import axios from 'axios';

const ManageSubscription = () => {
    const { user, updateUser } = useAuth();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount] = useState('999');
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [upgrading, setUpgrading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    
    // Calculate next payment date (30 days from now for demo purposes)
    const nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handleCardNumberChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        const formatted = val.replace(/(\d{4})/g, '$1 ').trim();
        setCardNumber(formatted);
    };

    const handleExpiryChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val.length >= 2) {
            setCardExpiry(`${val.slice(0, 2)}/${val.slice(2, 4)}`);
        } else {
            setCardExpiry(val);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setUpgrading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const response = await axios.put('/api/company/upgrade', {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.data.success) {
                updateUser({ ...user, subscriptionPlan: 'pro' });
                setShowPaymentModal(false);
                alert(`Payment of ₹${paymentAmount} processed successfully! Welcome to the Pro Plan.`);
            }
        } catch (error) {
            console.error("Upgrade error:", error);
            alert("Failed to process payment. Please try again.");
        } finally {
            setUpgrading(false);
        }
    };

    const handleCancelSubmit = async () => {
        setCancelling(true);
        try {
            const response = await axios.put('/api/company/cancel-subscription', {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.data.success) {
                updateUser({ ...user, subscriptionPlan: 'basic' });
                setShowCancelModal(false);
                alert(response.data.message);
            }
        } catch (error) {
            console.error("Cancel error:", error);
            alert("Failed to cancel subscription. Please try again.");
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-slide-in-right">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-purple-600 flex items-center justify-center text-white shadow-lg shadow-[#6C63FF]/20">
                        <FaStar className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Manage Plan</p>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Subscription</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl">
                <div className="glass-panel rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                Current Plan: 
                                <span className={`px-4 py-1.5 rounded-full text-sm font-extrabold uppercase tracking-widest ${
                                    user?.subscriptionPlan === 'pro' 
                                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                                    : 'bg-slate-800 text-slate-300'
                                }`}>
                                    {user?.subscriptionPlan === 'pro' ? 'Pro' : 'Basic'}
                                </span>
                            </h2>
                            <p className="text-slate-400 text-sm">
                                {user?.subscriptionPlan === 'pro' 
                                    ? `Next payment of ₹999 on ${nextPaymentDate}`
                                    : "You are on the free tier. Upgrade to unlock all features."}
                            </p>
                        </div>
                        {user?.subscriptionPlan === 'basic' && (
                            <button
                                onClick={() => setShowPaymentModal(true)}
                                className="px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#b346e5] text-white shadow-lg hover:shadow-[#6C63FF]/30 transition-all text-sm flex items-center justify-center space-x-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span>Upgrade to Pro</span>
                                <FaArrowRight className="text-xs" />
                            </button>
                        )}
                        {user?.subscriptionPlan === 'pro' && (
                            <div className="flex flex-col items-end gap-3">
                                <div className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 text-sm font-semibold flex items-center gap-2">
                                    <FaCheckCircle className="text-emerald-500" /> Active Subscription
                                </div>
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="text-xs font-semibold text-rose-500 hover:text-rose-400 transition-colors underline underline-offset-2"
                                >
                                    Cancel Subscription
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <FaCheckCircle className="text-emerald-400" /> Features Available
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-start space-x-3 text-sm text-slate-300">
                                    <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <span>Employee Directory Management</span>
                                </li>
                                <li className="flex items-start space-x-3 text-sm text-slate-300">
                                    <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <span>Basic Leave Tracking</span>
                                </li>
                                <li className="flex items-start space-x-3 text-sm text-slate-300">
                                    <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <span>Dashboard Analytics</span>
                                </li>
                                {user?.subscriptionPlan === 'pro' && (
                                    <>
                                        <li className="flex items-start space-x-3 text-sm text-white font-semibold">
                                            <FaCrown className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                            <span>Unlimited Employees & Departments</span>
                                        </li>
                                        <li className="flex items-start space-x-3 text-sm text-white font-semibold">
                                            <FaCrown className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                            <span>Full Payroll Processing & PDF Slips</span>
                                        </li>
                                        <li className="flex items-start space-x-3 text-sm text-white font-semibold">
                                            <FaCrown className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                            <span>Advanced Notice Board</span>
                                        </li>
                                        <li className="flex items-start space-x-3 text-sm text-white font-semibold">
                                            <FaCrown className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                            <span>Priority Support Chat</span>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                        {user?.subscriptionPlan === 'basic' && (
                            <div className="space-y-6 opacity-60">
                                <h3 className="text-lg font-bold text-slate-500 flex items-center gap-2">
                                    <FaTimesCircle className="text-slate-600" /> Locked Features (Pro)
                                </h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start space-x-3 text-sm text-slate-400">
                                        <FaCrown className="text-slate-600 mt-0.5 flex-shrink-0" />
                                        <span>Unlimited Employees (Cap at 10)</span>
                                    </li>
                                    <li className="flex items-start space-x-3 text-sm text-slate-400">
                                        <FaCrown className="text-slate-600 mt-0.5 flex-shrink-0" />
                                        <span>Payroll Generation & Slips</span>
                                    </li>
                                    <li className="flex items-start space-x-3 text-sm text-slate-400">
                                        <FaCrown className="text-slate-600 mt-0.5 flex-shrink-0" />
                                        <span>Notice Board & Announcements</span>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
                                    ₹ {paymentAmount}
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
                                        'Pay ₹999'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                </div>
            </div>, document.body)}

            {/* Cancel Confirmation Modal */}
            {showCancelModal && createPortal(
                <div className="relative z-[9999]">
                    <div className="fixed inset-0 bg-[#040408]/80 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => !cancelling && setShowCancelModal(false)}></div>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <div className="relative w-full max-w-sm transform rounded-2xl border border-rose-500/30 bg-slate-900 shadow-2xl shadow-rose-900/20 p-6 text-left align-middle transition-all">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 mx-auto mb-4">
                                    <FaTimesCircle className="text-2xl text-rose-500" />
                                </div>
                                <h3 className="text-lg font-bold text-white text-center mb-2">Cancel Subscription?</h3>
                                <p className="text-sm text-slate-400 text-center mb-6">
                                    Are you sure you want to cancel your Pro plan? You will lose access to all premium features immediately and be downgraded to the Basic plan.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCancelModal(false)}
                                        disabled={cancelling}
                                        className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                                    >
                                        Keep Pro Plan
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelSubmit}
                                        disabled={cancelling}
                                        className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {cancelling ? (
                                            <>
                                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Cancelling...
                                            </>
                                        ) : 'Yes, Cancel'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>, document.body
            )}
        </div>
    );
};

export default ManageSubscription;
