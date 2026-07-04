import React, { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const API = '/api/attendance';

const PunchCard = () => {
    const [status, setStatus] = useState({ checkedIn: false, checkedOut: false });
    const [statusLoading, setStatusLoading] = useState(true);
    const [statusError, setStatusError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success'|'error', text: '' }
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getAuthHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    });

    const fetchAttendanceStatus = async () => {
        setStatusError(null);
        try {
            const res = await axios.get(`${API}/status`, { headers: getAuthHeaders() });
            if (res.data.success) {
                setStatus(res.data);
            }
        } catch (err) {
            console.error('Attendance status error:', err);
            setStatusError(err.response?.data?.error || 'Could not fetch attendance status');
        } finally {
            setStatusLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendanceStatus();
    }, []);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleCheckIn = async () => {
        if (status.checkedIn) return;
        setActionLoading(true);
        try {
            const res = await axios.post(`${API}/check-in`, {}, { headers: getAuthHeaders() });
            if (res.data.success) {
                showMessage('success', res.data.message || 'Checked in successfully!');
                await fetchAttendanceStatus();
            }
        } catch (err) {
            console.error('CheckIn error:', err);
            showMessage('error', err.response?.data?.error || 'Error checking in');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckOut = async () => {
        if (!status.checkedIn || status.checkedOut) return;
        setActionLoading(true);
        try {
            const res = await axios.post(`${API}/check-out`, {}, { headers: getAuthHeaders() });
            if (res.data.success) {
                showMessage('success', res.data.message || 'Checked out successfully!');
                await fetchAttendanceStatus();
            }
        } catch (err) {
            console.error('CheckOut error:', err);
            showMessage('error', err.response?.data?.error || 'Error checking out');
        } finally {
            setActionLoading(false);
        }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '--:--';
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getBadge = () => {
        if (statusLoading) return { label: 'Loading...', cls: 'bg-slate-500/10 text-slate-400 border-slate-700/30' };
        if (status.checkedOut) return { label: 'Shift Completed', cls: 'bg-slate-500/10 text-slate-400 border-slate-700/30' };
        if (status.checkedIn) return { label: 'On Duty', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
        return { label: 'Not Punched', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    };

    const badge = getBadge();

    const checkInDisabled = actionLoading || status.checkedIn;
    const checkOutDisabled = actionLoading || !status.checkedIn || status.checkedOut;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Check-in controller panel */}
            <div className="future-card p-6 space-y-6 flex flex-col justify-between">
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-white text-base">Punch Work Hours</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.cls}`}>
                            {badge.label}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Mark your presence by punches. This records timestamp details on enterprise servers.
                    </p>
                </div>

                {/* Status / error banner */}
                {statusError && (
                    <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                        ⚠ {statusError} —{' '}
                        <button
                            onClick={fetchAttendanceStatus}
                            className="underline hover:text-red-300 cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Inline action message */}
                {message && (
                    <div
                        className={`text-[11px] rounded-lg px-3 py-2 border ${
                            message.type === 'success'
                                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                : 'text-red-400 bg-red-500/10 border-red-500/20'
                        }`}
                    >
                        {message.type === 'success' ? '✓' : '✗'} {message.text}
                    </div>
                )}

                {/* Digital running clock */}
                <div className="py-6 flex flex-col items-center justify-center bg-slate-950/70 border border-slate-900/50 rounded-xl space-y-1 shadow-inner">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Current Time</span>
                    <span className="text-3xl font-extrabold text-white tracking-widest">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                </div>

                {/* Punch buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={handleCheckIn}
                        disabled={checkInDisabled}
                        className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/20 text-white font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {actionLoading && !checkOutDisabled ? (
                            <FaSpinner className="animate-spin text-xs" />
                        ) : (
                            <FaCheckCircle className="text-xs" />
                        )}
                        <span>Check In</span>
                    </button>
                    <button
                        onClick={handleCheckOut}
                        disabled={checkOutDisabled}
                        className="py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:shadow-lg hover:shadow-amber-500/20 text-white font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {actionLoading && checkInDisabled ? (
                            <FaSpinner className="animate-spin text-xs" />
                        ) : (
                            <FaClock className="text-xs" />
                        )}
                        <span>Check Out</span>
                    </button>
                </div>
            </div>

            {/* Punch timestamps logs summary */}
            <div className="future-card p-6 space-y-4">
                <h4 className="font-bold text-white text-base">Punch Timeline Today</h4>

                <div className="space-y-4 pt-2">
                    {/* Check-in timestamp node */}
                    <div className="flex items-start space-x-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                            status.checkedIn
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                                : 'bg-slate-950 text-slate-600 border border-slate-800'
                        }`}>
                            IN
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-slate-300">Checked In Log</p>
                            <p className="text-[11px] text-slate-500">
                                {statusLoading
                                    ? 'Fetching...'
                                    : status.checkedIn
                                        ? `Punched at ${formatTime(status.checkInTime)}`
                                        : 'No punch recorded yet'}
                            </p>
                        </div>
                    </div>

                    {/* Check-out timestamp node */}
                    <div className="flex items-start space-x-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                            status.checkedOut
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                                : 'bg-slate-950 text-slate-600 border border-slate-800'
                        }`}>
                            OUT
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-slate-300">Checked Out Log</p>
                            <p className="text-[11px] text-slate-500">
                                {statusLoading
                                    ? 'Fetching...'
                                    : status.checkedOut
                                        ? `Punched at ${formatTime(status.checkOutTime)}`
                                        : status.checkedIn
                                            ? 'Shift active, waiting for punch out'
                                            : 'No punch recorded yet'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PunchCard;
