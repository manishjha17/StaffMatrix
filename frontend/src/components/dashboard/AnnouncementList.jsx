import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/authContext';
import { FaBullhorn, FaPlus, FaTrash } from 'react-icons/fa';

const AnnouncementList = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'low'
    });
    const [submitLoading, setSubmitLoading] = useState(false);

    const fetchAnnouncements = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/announcement', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setAnnouncements(response.data.announcements);
            }
        } catch (error) {
            console.error("Error fetching announcements:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/announcement/add', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setShowAddForm(false);
                setFormData({ title: '', description: '', priority: 'low' });
                fetchAnnouncements();
            }
        } catch (error) {
            console.error("Error adding announcement:", error);
            alert("Failed to post announcement. Are you on the Pro plan?");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`/api/announcement/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                fetchAnnouncements();
            }
        } catch (error) {
            console.error("Error deleting announcement:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                    <FaBullhorn className="text-[#6C63FF]" />
                    <span>Company Notice Board</span>
                </h3>
                {user?.role === 'admin' && !showAddForm && (
                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="bg-[#6C63FF] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-semibold transition-all"
                    >
                        <FaPlus />
                        <span>Post Announcement</span>
                    </button>
                )}
            </div>

            {showAddForm && user?.role === 'admin' && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-lg backdrop-blur-sm animate-fade-in">
                    <h4 className="text-lg font-bold text-white mb-4">New Announcement</h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</label>
                            <input 
                                type="text" 
                                name="title" 
                                required 
                                value={formData.title} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2 mt-1 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-[#6C63FF]/50" 
                                placeholder="E.g., Office closed on Friday"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</label>
                            <textarea 
                                name="description" 
                                required 
                                value={formData.description} 
                                onChange={handleChange} 
                                rows="3"
                                className="w-full px-4 py-2 mt-1 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-[#6C63FF]/50" 
                                placeholder="Details about the announcement..."
                            ></textarea>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</label>
                            <select 
                                name="priority" 
                                value={formData.priority} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2 mt-1 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-[#6C63FF]/50"
                            >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority (Urgent)</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-3 pt-2">
                            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors">Cancel</button>
                            <button type="submit" disabled={submitLoading} className="px-4 py-2 bg-[#6C63FF] hover:bg-[#4F46E5] text-white rounded-xl font-bold transition-all">
                                {submitLoading ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-slate-400">Loading notices...</div>
            ) : announcements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {announcements.map((announcement) => (
                        <div key={announcement._id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-lg backdrop-blur-sm relative group hover:-translate-y-1 transition-all">
                            {user?.role === 'admin' && (
                                <button onClick={() => handleDelete(announcement._id)} className="absolute top-4 right-4 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FaTrash />
                                </button>
                            )}
                            <div className="flex items-center space-x-2 mb-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                    announcement.priority === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                    announcement.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                    'bg-[#22D3EE]/10 text-[#22D3EE] border-[#22D3EE]/20'
                                }`}>
                                    {announcement.priority} Priority
                                </span>
                                <span className="text-xs text-slate-500">{new Date(announcement.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2">{announcement.title}</h4>
                            <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{announcement.description}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center shadow-lg backdrop-blur-sm">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaBullhorn className="text-2xl text-slate-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No Announcements</h3>
                    <p className="text-sm text-slate-400">There are no notices on the board right now.</p>
                </div>
            )}
        </div>
    );
};

export default AnnouncementList;
