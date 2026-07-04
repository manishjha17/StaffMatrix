import axios from "axios";
import { useNavigate } from "react-router-dom";

export const columns=[
    {
        name:"S No",
        selector:(row)=>row.sno,
        width:"70px"
    },
    {
        name:"Name",
        selector:(row)=>row.name,
        sortable:true,
        width:"100px"

    },
    {
        name:"Image",
        selector:(row)=>row.profileImage,
        width:"150px"

    },
    {
        name:"Department",
        selector:(row)=>row.dep_name,
        width:"300px"

    },
    {
        name:"DOB",
        selector:(row)=>row.dob,
        sortable:true,
        width:"100px",
        center:true

    },
    {
        name:"Action",
        selector:(row)=>row.action,
        center:true
    },
];


export const fetchDepartments = async () => {
    let departments
    try {
        const response = await axios.get('/api/department', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
        })
        if (response.data.success) {
            departments=response.data.departments
        }
    } catch (error) {
        if (error.response && !error.response.data.success) {
            alert(error.response.data.error);
        }
    }
    return departments
};

//employees for salary form
export const getEmployees = async (id) => {
    let employees;
    try {
        const response = await axios.get(`/api/employee/department/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
        })
        if (response.data.success) {
            employees=response.data.employees
        }
    } catch (error) {
        if (error.response && !error.response.data.success) {
            alert(error.response.data.error);
        }
    }
    return employees
};

export const EmployeeButtons=({Id})=>{
    const navigate=useNavigate()

    return(
        <div className="flex space-x-1.5">
            <button className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-600 hover:text-white hover:border-transparent transition-all text-xs font-semibold cursor-pointer"
             onClick={()=>navigate(`/admin-dashboard/employees/${Id}`)}>View</button>

            <button className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-600 hover:text-white hover:border-transparent transition-all text-xs font-semibold cursor-pointer"
            onClick={()=>navigate(`/admin-dashboard/employees/edit/${Id}`)}>Edit</button>

             <button onClick={()=>navigate(`/admin-dashboard/employees/salary/${Id}`)}  className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg hover:bg-cyan-600 hover:text-white hover:border-transparent transition-all text-xs font-semibold cursor-pointer">Salary</button>

             <button className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-600 hover:text-white hover:border-transparent transition-all text-xs font-semibold cursor-pointer"
              onClick={()=>navigate(`/admin-dashboard/employees/leaves/${Id}`)}>Leave</button>
        </div>
    )
}