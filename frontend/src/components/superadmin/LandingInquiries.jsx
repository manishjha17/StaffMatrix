import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEnvelope, FaClock, FaUser, FaReply, FaTrash } from 'react-icons/fa';

const LandingInquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInquiries = async () => {
            try {
                const response = await axios.get('/api/landing/inquiries', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.data.success) {
                    setInquiries(response.data.inquiries);
                }
            } catch (err) {
                setError('Failed to load inquiries.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInquiries();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
        
        try {
            const response = await axios.delete(`/api/landing/inquiries/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.data.success) {
                setInquiries(inquiries.filter(inquiry => inquiry._id !== id));
            }
        } catch (err) {
            console.error(err);
            alert("Failed to delete inquiry.");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-rose-500 text-center mt-10 p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">{error}</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800">
                <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    <FaEnvelope className="text-indigo-400" />
                    Landing Page Inquiries
                </h1>
                <div className="bg-slate-800 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300">
                    Total: {inquiries.length}
                </div>
            </div>

            {inquiries.length === 0 ? (
                <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-800">
                    <FaEnvelope className="text-6xl text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No inquiries received yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {inquiries.map((inquiry) => (
                        <div key={inquiry._id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm hover:border-indigo-500/30 transition-colors">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                        <FaUser />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">{inquiry.name}</h3>
                                        <a href={`mailto:${inquiry.email}`} className="text-indigo-400 text-sm hover:underline flex items-center gap-1">
                                            {inquiry.email}
                                        </a>
                                    </div>
                                </div>
                                <div className="text-slate-500 text-xs flex items-center gap-1 font-medium bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                                    <FaClock />
                                    {new Date(inquiry.createdAt).toLocaleString()}
                                </div>
                            </div>
                            
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                                {inquiry.message}
                            </div>
                            
                            <div className="mt-4 flex justify-end gap-3">
                                <a 
                                    href={`mailto:${inquiry.email}?subject=Re: Your Inquiry to Synapse HR`}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-indigo-900/20"
                                >
                                    <FaReply />
                                    Reply via Email
                                </a>
                                <button
                                    onClick={() => handleDelete(inquiry._id)}
                                    className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/30 text-rose-500 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
                                >
                                    <FaTrash />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LandingInquiries;
