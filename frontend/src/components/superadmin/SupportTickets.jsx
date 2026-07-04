import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaHeadset, FaBuilding, FaCheckCircle, FaPaperPlane, FaTimes } from 'react-icons/fa';

const SupportTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [activeTicketId, setActiveTicketId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState("");

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
                    // Try to open first unresolved ticket by default
                    const openTicket = response.data.tickets.find(t => t.status === 'open');
                    setActiveTicketId(openTicket ? openTicket._id : response.data.tickets[0]._id);
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
        const interval = setInterval(fetchTickets, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeTicketId, tickets]);

    const handleResolve = async (id) => {
        if (!window.confirm("Mark this ticket as resolved? This will close the chat.")) return;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`/api/support/${id}/resolve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                fetchTickets();
            }
        } catch (error) {
            console.error("Error resolving ticket:", error);
            alert("Failed to resolve ticket");
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

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h3 className="text-2xl font-extrabold text-white flex items-center space-x-2">
                        <FaHeadset className="text-[#22D3EE]" />
                        <span>Support Console</span>
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">Manage and resolve incoming chat requests</p>
                </div>
            </div>

            <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex relative">
                {/* Left Sidebar: All Tickets */}
                <div className="w-1/3 border-r border-slate-800 flex flex-col bg-slate-950/40">
                    <div className="p-4 border-b border-slate-800/60 flex justify-between items-center bg-slate-900">
                        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">All Tickets</h4>
                        <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold">
                            {tickets.filter(t => t.status === 'open').length} Open
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="text-slate-500 text-sm p-4 text-center">Loading tickets...</div>
                        ) : tickets.length === 0 ? (
                            <div className="text-slate-500 text-sm p-8 text-center">No support requests.</div>
                        ) : (
                            tickets.map(ticket => (
                                <div 
                                    key={ticket._id}
                                    onClick={() => setActiveTicketId(ticket._id)}
                                    className={`p-4 border-b border-slate-800/40 cursor-pointer transition-colors hover:bg-slate-800/30 ${activeTicketId === ticket._id ? 'bg-[#22D3EE]/10 border-l-4 border-l-[#22D3EE]' : 'border-l-4 border-l-transparent'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h5 className="font-bold text-sm text-slate-200 truncate pr-2 flex items-center">
                                            <FaBuilding className="mr-2 text-slate-500" />
                                            {ticket.companyId?.name || 'Unknown Company'}
                                        </h5>
                                        {ticket.status === 'resolved' ? (
                                            <span className="shrink-0 text-emerald-400"><FaCheckCircle className="text-xs" /></span>
                                        ) : (
                                            <span className="shrink-0 w-2 h-2 rounded-full bg-amber-400 mt-1"></span>
                                        )}
                                    </div>
                                    <p className="text-xs font-semibold text-slate-400 truncate mb-1">{ticket.subject}</p>
                                    <p className="text-[10px] text-slate-500 truncate">
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
                                    <h4 className="font-bold text-white text-base">{activeTicket.subject}</h4>
                                    <div className="text-xs text-slate-400 mt-0.5 flex items-center space-x-2">
                                        <span>Company: <span className="font-semibold text-slate-300">{activeTicket.companyId?.name}</span></span>
                                        <span>•</span>
                                        <span>User: {activeTicket.userId?.name}</span>
                                    </div>
                                </div>
                                {activeTicket.status === 'open' && (
                                    <button 
                                        onClick={() => handleResolve(activeTicket._id)}
                                        className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-emerald-500/30 hover:border-emerald-500 flex items-center space-x-2"
                                    >
                                        <FaCheckCircle /> <span>Mark Resolved</span>
                                    </button>
                                )}
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {activeTicket.messages.map((msg, idx) => {
                                    const isSuperadmin = msg.senderRole === 'superadmin';
                                    return (
                                        <div key={idx} className={`flex ${isSuperadmin ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] rounded-2xl p-4 shadow-md ${isSuperadmin ? 'bg-[#22D3EE]/20 border border-[#22D3EE]/30 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'}`}>
                                                <div className={`text-xs font-semibold mb-1 opacity-70 ${isSuperadmin ? 'text-[#22D3EE]' : 'text-slate-400'}`}>
                                                    {isSuperadmin ? 'You (Superadmin)' : 'Company Admin'}
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
                                        This ticket is resolved.
                                    </div>
                                ) : (
                                    <form onSubmit={handleSendReply} className="flex space-x-2">
                                        <input 
                                            type="text" 
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Type your reply to the company admin..."
                                            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#22D3EE]"
                                        />
                                        <button 
                                            type="submit"
                                            disabled={!replyText.trim()}
                                            className="bg-[#22D3EE] hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 w-12 rounded-xl flex items-center justify-center transition-colors"
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
                            <p>Select a ticket from the left to view the chat.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportTickets;
