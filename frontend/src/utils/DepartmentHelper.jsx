import axios from "axios"
import { useNavigate } from "react-router-dom"


export const columns=[
    {
        name:"S No",
        selector:(row)=>row.sno
    },
    {
        name:"Department Name",
        selector:(row)=>row.dep_name,
        sortable:true
    },
    {
        name:"Action",
        selector:(row)=>row.action
    },
]

export const DepartmentButtons=({Id,onDepartmentDelete})=>{
    const navigate=useNavigate()

    const handleDelete=async (id)=>{
        const confirm=window.confirm("Do you want to delete?")
        if(confirm){
        try{
                
                const response=await axios.delete(`/api/department/${id}`,{
                    headers:{
                        "Authorization":`Bearer ${localStorage.getItem('token')}`
                    }    
                })
                if(response.data.success){
                    onDepartmentDelete()
                }
            }catch(error){
                if(error.response && !error.response.data.success){
                    alert(error.response.data.error);
                }
            }
        }
    }

    return(
        <div className="flex space-x-2">
            <button className="px-3.5 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all text-xs font-semibold cursor-pointer"
             onClick={()=>navigate(`/admin-dashboard/department/${Id}`)}>Edit</button>
            <button className="px-3.5 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-600 hover:text-white hover:border-transparent transition-all text-xs font-semibold cursor-pointer"
             onClick={()=>handleDelete(Id)}>Delete</button>
        </div>
    )
}