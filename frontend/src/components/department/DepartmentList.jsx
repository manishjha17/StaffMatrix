import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBuilding, FaSearch, FaEdit, FaTrash, FaPlus, FaSitemap, FaUsers, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

/* ── Delete confirmation modal ── */
const DeleteModal = ({ target, onConfirm, onCancel, loading }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="glass-panel rounded-2xl border border-rose-900/50 p-8 max-w-sm w-full mx-4 shadow-[0_0_40px_rgba(225,29,72,0.15)] animate-fade-in-up relative overflow-hidden bg-rose-950/20">
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-rose-600 via-red-500 to-orange-500" />
            <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                    <FaExclamationTriangle className="text-rose-400 text-3xl animate-pulse" />
                </div>
                <div>
                    <h3 className="text-xl font-extrabold text-white">Warning: Delete Department?</h3>
                    <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                        You're about to permanently delete <span className="text-white font-bold">"{target?.dep_name}"</span>.
                    </p>
                    {target?.employeeCount > 0 && (
                        <div className="mt-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl">
                            <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1"><FaExclamationTriangle /> Critical Warning</p>
                            <p className="text-slate-300 text-xs">
                                This department currently has <span className="text-white font-bold">{target.employeeCount} active employees</span> assigned to it. Deleting it may cause system errors.
                            </p>
                        </div>
                    )}
                </div>
                <div className="flex gap-3 w-full pt-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-sm font-semibold cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-sm hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading
                            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting…</>
                            : 'Yes, Delete'}
                    </button>
                </div>
            </div>
        </div>
    </div>
);

/* ── Utilities for colors ── */
const getColors = (index) => {
    const palettes = [
        { bg: 'from-indigo-600/30 to-violet-600/20', border: 'border-indigo-500/20', text: 'text-indigo-400' },
        { bg: 'from-emerald-600/30 to-teal-600/20', border: 'border-emerald-500/20', text: 'text-emerald-400' },
        { bg: 'from-amber-600/30 to-orange-600/20', border: 'border-amber-500/20', text: 'text-amber-400' },
        { bg: 'from-rose-600/30 to-pink-600/20', border: 'border-rose-500/20', text: 'text-rose-400' },
        { bg: 'from-cyan-600/30 to-blue-600/20', border: 'border-cyan-500/20', text: 'text-cyan-400' },
    ];
    return palettes[index % palettes.length];
};

/* ── Department card ── */
const DeptCard = ({ dep, index, onEdit, onDelete }) => {
    const colors = getColors(index);
    
    return (
        <div
            className="group glass-panel rounded-2xl border border-slate-800 hover:border-slate-600 p-6 flex flex-col transition-all hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1 relative overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.bg} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />
            
            <div className="flex items-start justify-between mb-4 z-10">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.bg} ${colors.border} border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <FaBuilding className={`${colors.text} text-2xl`} />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(dep._id)}
                        className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-transparent flex items-center justify-center transition-all cursor-pointer"
                        title="Edit Department"
                    >
                        <FaEdit className="text-[11px]" />
                    </button>
                    <button
                        onClick={() => onDelete(dep)}
                        className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:bg-rose-600 hover:text-white hover:border-transparent flex items-center justify-center transition-all cursor-pointer"
                        title="Delete Department"
                    >
                        <FaTrash className="text-[11px]" />
                    </button>
                </div>
            </div>

            <div className="flex-1 z-10">
                <h3 className="text-white font-bold text-xl truncate mb-1">{dep.dep_name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-3">
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">ID: {dep._id?.slice(-6).toUpperCase()}</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                        <FaUsers /> {dep.employeeCount || 0} Employees
                    </span>
                </div>
                
                <p className="text-sm text-slate-400 line-clamp-2">
                    {dep.description || "No description provided for this department. Edit to add one."}
                </p>
            </div>
            
            <div className="mt-5 pt-4 border-t border-slate-800/50 flex items-center justify-between z-10">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                    <FaInfoCircle /> Added {new Date(dep.createdAt).toLocaleDateString()}
                </span>
            </div>
        </div>
    );
};

/* ── Main component ── */
const DepartmentList = () => {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/department', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (res.data.success) {
                setDepartments(res.data.departments);
                setFiltered(res.data.departments);
            }
        } catch (err) {
            if (err.response && !err.response.data.success) alert(err.response.data.error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDepartments(); }, []);

    const handleSearch = (e) => {
        const q = e.target.value;
        setSearchTerm(q);
        setFiltered(departments.filter(d => 
            d.dep_name.toLowerCase().includes(q.toLowerCase()) || 
            (d.description && d.description.toLowerCase().includes(q.toLowerCase()))
        ));
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await axios.delete(`/api/department/${deleteTarget._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (res.data.success) {
                setDeleteTarget(null);
                fetchDepartments();
            }
        } catch (err) {
            if (err.response && !err.response.data.success) alert(err.response.data.error);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            {deleteTarget && (
                <DeleteModal
                    target={deleteTarget}
                    loading={deleting}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            <div className="space-y-6 animate-fade-in-up">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Manage Departments</h1>
                        <p className="text-slate-400 text-sm mt-1">Add, update or remove organization branches</p>
                    </div>
                    <Link
                        to="/admin-dashboard/add-department"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-xl text-sm font-bold cursor-pointer"
                    >
                        <FaPlus className="text-xs" /> Add Department
                    </Link>
                </div>

                {/* ── Stats strip ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="glass-panel rounded-2xl border border-slate-800 p-4 flex items-center gap-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/4" />
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center relative z-10">
                            <FaSitemap className="text-indigo-400" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Depts</p>
                            <p className="text-2xl font-extrabold text-white">{departments.length}</p>
                        </div>
                    </div>
                    <div className="glass-panel rounded-2xl border border-slate-800 p-4 flex items-center gap-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/4" />
                        <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/20 flex items-center justify-center relative z-10">
                            <FaUsers className="text-emerald-400" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Headcount</p>
                            <p className="text-2xl font-extrabold text-white">
                                {departments.reduce((acc, curr) => acc + (curr.employeeCount || 0), 0)}
                            </p>
                        </div>
                    </div>
                    <div className="glass-panel rounded-2xl border border-slate-800 p-4 sm:col-span-1 col-span-2">
                        <div className="relative h-full flex items-center">
                            <FaSearch className="absolute left-3 text-slate-500 text-sm" />
                            <input
                                type="text"
                                placeholder="Search departments…"
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full h-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Cards grid ── */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filtered.map((dep, i) => (
                            <DeptCard
                                key={dep._id}
                                dep={dep}
                                index={i}
                                onEdit={(id) => navigate(`/admin-dashboard/department/${id}`)}
                                onDelete={(dep) => setDeleteTarget(dep)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="glass-panel rounded-2xl border border-slate-800 py-20 text-center">
                        <FaBuilding className="text-slate-700 text-5xl mx-auto mb-4" />
                        <p className="text-slate-400 font-semibold text-lg">No departments found</p>
                        <p className="text-slate-600 text-sm mt-1">
                            {searchTerm ? `No results for "${searchTerm}"` : 'Add your first department to get started'}
                        </p>
                        {!searchTerm && (
                            <Link
                                to="/admin-dashboard/add-department"
                                className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:scale-[1.02] transition-all cursor-pointer"
                            >
                                <FaPlus className="text-xs" /> Add First Department
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default DepartmentList;