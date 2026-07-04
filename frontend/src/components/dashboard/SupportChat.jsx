import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/authContext';
import { FaHeadset, FaPaperPlane, FaPlus, FaCheckCircle } from 'react-icons/fa';

const SupportChat = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [activeTicketId, setActiveTicketId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState("");
    const [showNewTicketModal, setShowNewTicketModal] = useState(false);
    const [newTicketData, setNewTicketData] = useState({ subject: '', message: '' });
    
    const messagesEndRef = useRef(null);

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/support', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setTickets(response.data.tickets);
                if (response.data.tickets.length > 0 && !activeTicketId) {
                    setActiveTicketId(response.data.tickets[0]._id);
                }
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
        // Set up polling for new messages every 10 seconds
        const interval = setInterval(fetchTickets, 10000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeTicketId, tickets]);

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/support/add', newTicketData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setShowNewTicketModal(false);
                setNewTicketData({ subject: '', message: '' });
                fetchTickets();
                setActiveTicketId(response.data.ticket._id);
            }
        } catch (error) {
            console.error("Failed to create ticket:", error);
            alert("Failed to create ticket");
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !activeTicketId) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`/api/support/${activeTicketId}/reply`, 
            { message: replyText }, 
            { headers: { Authorization: `Bearer ${token}` } });
            
            if (response.data.success) {
                setReplyText("");
                fetchTickets();
            }
        } catch (error) {
            console.error("Failed to send reply:", error);
        }
    };

    const activeTicket = tickets.find(t => t._id === activeTicketId);

    if (user?.subscriptionPlan !== 'pro') {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
                <FaHeadset className="text-6xl text-slate-700 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Priority Support</h2>
                <p className="text-slate-400">Upgrade to Pro to access our priority 24/7 Superadmin chat support.</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h3 className="text-2xl font-extrabold text-white flex items-center space-x-2">
                        <FaHeadset className="text-[#6C63FF]" />
                        <span>Support Chat</span>
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">Chat directly with Superadmin for priority assistance</p>
                </div>
                <button 
                    onClick={() => setShowNewTicketModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center space-x-2"
                >
                    <FaPlus /> <span>New Support Request</span>
                </button>
            </div>

            <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex relative">
                {/* Left Sidebar: Ticket List */}
                <div className="w-1/3 border-r border-slate-800 flex flex-col bg-slate-950/40">
                    <div className="p-4 border-b border-slate-800/60">
                        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Your Requests</h4>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="text-slate-500 text-sm p-4 text-center">Loading...</div>
                        ) : tickets.length === 0 ? (
                            <div className="text-slate-500 text-sm p-8 text-center">No support requests yet.</div>
                        ) : (
                            tickets.map(ticket => (
                                <div 
                                    key={ticket._id}
                                    onClick={() => setActiveTicketId(ticket._id)}
                                    className={`p-4 border-b border-slate-800/40 cursor-pointer transition-colors hover:bg-slate-800/30 ${activeTicketId === ticket._id ? 'bg-[#6C63FF]/10 border-l-4 border-l-[#6C63FF]' : 'border-l-4 border-l-transparent'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h5 className="font-bold text-sm text-slate-200 truncate pr-2">{ticket.subject}</h5>
                                        {ticket.status === 'resolved' ? (
                                            <span className="shrink-0 text-emerald-400"><FaCheckCircle className="text-xs" /></span>
                                        ) : (
                                            <span className="shrink-0 w-2 h-2 rounded-full bg-amber-400 mt-1"></span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">
                                        {ticket.messages[ticket.messages.length - 1]?.text || 'No messages'}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Area: Active Chat */}
                <div className="flex-1 flex flex-col relative bg-slate-900/40">
                    {activeTicket ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur shrink-0 z-10">
                                <div>
                                    <h4 className="font-bold text-white text-lg">{activeTicket.subject}</h4>
                                    <span className={`text-xs font-semibold uppercase tracking-wider ${activeTicket.status === 'resolved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {activeTicket.status}
                                    </span>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {activeTicket.messages.map((msg, idx) => {
                                    const isAdmin = msg.senderRole === 'admin';
                                    return (
                                        <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] rounded-2xl p-4 shadow-md ${isAdmin ? 'bg-[#6C63FF] text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'}`}>
                                                <div className="text-xs font-semibold mb-1 opacity-70">
                                                    {isAdmin ? 'You (Admin)' : 'Superadmin Support'}
                                                </div>
                                                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                                    {msg.text}
                                                </div>
                                                <div className="text-[10px] mt-2 opacity-50 text-right">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 bg-slate-900/80 border-t border-slate-800 shrink-0">
                                {activeTicket.status === 'resolved' ? (
                                    <div className="text-center p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-400 text-sm">
                                        This ticket has been resolved and closed.
                                    </div>
                                ) : (
                                    <form onSubmit={handleSendReply} className="flex space-x-2">
                                        <input 
                                            type="text" 
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6C63FF]"
                                        />
                                        <button 
                                            type="submit"
                                            disabled={!replyText.trim()}
                                            className="bg-[#6C63FF] hover:bg-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed text-white w-12 rounded-xl flex items-center justify-center transition-colors"
                                        >
                                            <FaPaperPlane />
                                        </button>
                                    </form>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <FaHeadset className="text-6xl mb-4 opacity-20" />
                            <p>Select a ticket to view chat or create a new one.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* New Ticket Modal */}
            {showNewTicketModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#6C63FF] to-[#22D3EE]" />
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-4">New Support Request</h3>
                            <form onSubmit={handleCreateTicket} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Subject</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={newTicketData.subject}
                                        onChange={(e) => setNewTicketData({...newTicketData, subject: e.target.value})}
                                        placeholder="Brief summary of the issue"
                                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#6C63FF] text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Initial Message</label>
                                    <textarea 
                                        required
                                        rows="4"
                                        value={newTicketData.message}
                                        onChange={(e) => setNewTicketData({...newTicketData, message: e.target.value})}
                                        placeholder="Describe your issue in detail..."
                                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#6C63FF] text-sm"
                                    ></textarea>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowNewTicketModal(false)}
                                        className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="bg-[#6C63FF] hover:bg-[#4F46E5] text-white px-5 py-2 rounded-xl font-bold text-sm transition-colors"
                                    >
                                        Start Chat
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportChat;
