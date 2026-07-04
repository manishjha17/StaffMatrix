import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserPlus, FaSearch, FaUsers, FaEye, FaEdit, FaMoneyBillWave, FaCalendarAlt, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import Avatar from '../common/Avatar';

const List = () => {
    const [employees, setEmployees] = useState([]);
    const [empLoading, setEmpLoading] = useState(true);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEmployees = async () => {
            setEmpLoading(true);
            try {
                const response = await axios.get('/api/employee', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.data.success) {
                    setEmployees(response.data.employees);
                    setFilteredEmployees(response.data.employees);
                }
            } catch (error) {
                if (error.response && !error.response.data.success) {
                    alert(error.response.data.error);
                }
            } finally {
                setEmpLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    const handleFilter = (e) => {
        const text = e.target.value.toLowerCase();
        setSearchTerm(text);
        const filtered = employees.filter(emp =>
            emp.userId?.name?.toLowerCase().includes(text) ||
            emp.department?.dep_name?.toLowerCase().includes(text) ||
            emp.employeeId?.toLowerCase().includes(text)
        );
        setFilteredEmployees(filtered);
    };

    const handleDeleteClick = (id) => {
        setEmployeeToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await axios.delete(`/api/employee/${employeeToDelete}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (response.data.success) {
                const updatedEmployees = employees.filter(emp => emp._id !== employeeToDelete);
                setEmployees(updatedEmployees);
                setFilteredEmployees(updatedEmployees.filter(emp =>
                    emp.userId?.name?.toLowerCase().includes(searchTerm) ||
                    emp.department?.dep_name?.toLowerCase().includes(searchTerm) ||
                    emp.employeeId?.toLowerCase().includes(searchTerm)
                ));
            }
        } catch (error) {
            if (error.response && !error.response.data.success) {
                alert(error.response.data.error);
            } else {
                alert("Server error occurred while deleting.");
            }
        } finally {
            setShowDeleteModal(false);
            setEmployeeToDelete(null);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Manage Employees</h1>
                    <p className="text-slate-400 text-sm mt-1">Review profiles, update statuses and process leaves</p>
                </div>
                <Link
                    to="/admin-dashboard/add-employee"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-xl text-sm font-bold cursor-pointer"
                >
                    <FaUserPlus className="text-xs" /> Add Employee
                </Link>
            </div>

            {/* Stats & Search Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel rounded-2xl border border-slate-800 p-4 flex items-center gap-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/4" />
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center relative z-10 shrink-0">
                        <FaUsers className="text-indigo-400 text-lg" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Employees</p>
                        <p className="text-2xl font-extrabold text-white">{employees.length}</p>
                    </div>
                </div>

                <div className="md:col-span-2 glass-panel rounded-2xl border border-slate-800 p-4">
                    <div className="relative h-full flex items-center">
                        <FaSearch className="absolute left-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by name, ID, or department..."
                            value={searchTerm}
                            onChange={handleFilter}
                            className="w-full h-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    {empLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                            <p className="text-slate-400 font-semibold">Loading employees...</p>
                        </div>
                    ) : filteredEmployees.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/80 border-b border-slate-800">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Profile</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Info</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filteredEmployees.map((emp) => (
                                    <tr key={emp._id} className="hover:bg-slate-800/30 transition-colors group">
                                        
                                        {/* Profile */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <Avatar
                                                        profileImage={emp.userId?.profileImage}
                                                        name={emp.userId?.name}
                                                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-sm"
                                                    />
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm">{emp.userId?.name || 'N/A'}</p>
                                                    <p className="text-slate-500 text-xs font-mono mt-0.5">ID: {emp.employeeId}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-6 py-4">
                                            <p className="text-slate-300 text-sm">{emp.designation}</p>
                                            <p className="text-slate-500 text-xs mt-0.5">DOB: {new Date(emp.dob).toLocaleDateString()}</p>
                                        </td>

                                        {/* Department */}
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                                                {emp.department?.dep_name || 'N/A'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => navigate(`/admin-dashboard/employees/${emp._id}`)}
                                                    className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                                                    title="View Profile"
                                                >
                                                    <FaEye className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin-dashboard/employees/edit/${emp._id}`)}
                                                    className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                                                    title="Edit Employee"
                                                >
                                                    <FaEdit className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin-dashboard/employees/salary/${emp._id}`)}
                                                    className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all cursor-pointer"
                                                    title="Manage Salary"
                                                >
                                                    <FaMoneyBillWave className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin-dashboard/employees/leaves/${emp._id}`)}
                                                    className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                                                    title="Manage Leaves"
                                                >
                                                    <FaCalendarAlt className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(emp._id)}
                                                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                                    title="Delete Employee"
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-20 text-center">
                            <FaUsers className="text-slate-700 text-5xl mx-auto mb-4" />
                            <p className="text-slate-400 font-semibold text-lg">No employees found</p>
                            <p className="text-slate-600 text-sm mt-1">
                                {searchTerm ? `No results for "${searchTerm}"` : 'Add your first employee to get started'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 to-rose-500" />
                        
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                                <FaExclamationTriangle className="text-xl" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Delete Employee?</h3>
                                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                                    Are you absolutely sure? This will permanently delete the employee, their user account, salary history, leave records, and attendance logs. This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-semibold cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition-colors text-sm font-bold cursor-pointer"
                            >
                                Delete Employee
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default List;
