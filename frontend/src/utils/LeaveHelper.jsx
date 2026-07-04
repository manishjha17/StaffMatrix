import { useNavigate } from "react-router-dom";

export const columns = [
  {
    name: "S No",
    selector: (row) => row.sno,
    width: "70px",
  },
  {
    name: "Emp ID",
    selector: (row) => row.employeeId,
    width: "120px",
  },
  {
    name: "Name",
    selector: (row) => row.name,
    width: "120px",
  },
  {
    name: "Leave Type",
    selector: (row) => row.leaveType,
    width: "140px",
  },
  {
    name: "Department",
    selector: (row) => row.department,
    width: "170px",
  },
  {
    name: "Days",
    selector: (row) => row.days,
    width: "80px",
  },
  {
    name: "Status",
    selector: (row) => row.status,
    width: "120px",
    cell: (row) => {
      let statusColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
      if (row.status === "Approved") statusColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      else if (row.status === "Rejected") statusColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
      return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColor}`}>
          {row.status}
        </span>
      );
    }
  },
  {
    name: "Action",
    selector: (row) => row.action,
    center: true,
  },
];

export const LeaveButtons = ({ Id }) => {
  const navigate = useNavigate();

  const handleView = (id) => {
    navigate(`/admin-dashboard/leaves/${id}`);
  };

  return (
    <button
      className="px-3.5 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all text-xs font-semibold cursor-pointer"
      onClick={() => handleView(Id)}
    >
      View
    </button>
  );
};