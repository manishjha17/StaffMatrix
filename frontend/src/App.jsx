import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";
import PrivateRoutes from "./utils/PrivateRoutes.jsx";
import RoleBaseRoutes from "./utils/RoleBaseRoutes.jsx";
import AdminSummary from "./components/dashboard/AdminSummary.jsx";
import DepartmentList from "./components/department/DepartmentList.jsx";
import AddDepartment from "./components/department/AddDepartment.jsx";
import EditDepartment from "./components/department/EditDepartment.jsx";
import List from "./components/employee/List.jsx";
import Add from "./components/employee/Add.jsx";
import View from "./components/employee/View.jsx";
import Edit from "./components/employee/Edit.jsx";
import AddSalary from "./components/salary/Add.jsx"
import ViewSalary from "./components/salary/View.jsx"
import Summary from "./components/EmployeeDahsboard/Summary.jsx";
import LeaveList from "./components/leave/List.jsx"
import AddLeave from "./components/leave/Add.jsx"
import Setting from "./components/EmployeeDahsboard/Setting.jsx";
import Table from "./components/leave/Table.jsx";
import Detail from "./components/leave/Detail.jsx";
import AttendanceList from "./components/attendance/AttendanceList.jsx";
import Reports from "./components/reports/Reports.jsx";
import SuperAdminDashboard from "./pages/SuperAdminDashboard.jsx";
import CompanyList from "./components/superadmin/CompanyList.jsx";
import AddCompany from "./components/superadmin/AddCompany.jsx";
import RegisterCompany from "./pages/RegisterCompany.jsx";
import SupportTickets from "./components/superadmin/SupportTickets.jsx";
import LandingInquiries from "./components/superadmin/LandingInquiries.jsx";
import SupportChat from "./components/dashboard/SupportChat.jsx";
import AnnouncementList from "./components/dashboard/AnnouncementList.jsx";
import ManageSubscription from "./components/dashboard/ManageSubscription.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />}></Route>
        <Route path="/register-company" element={<RegisterCompany />}></Route>
        <Route path="/Login" element={<Navigate to="/" replace />}></Route>
        <Route path="/admin-dashboard" element={
          <PrivateRoutes>
            <RoleBaseRoutes requiredRole={["admin"]}>
              <AdminDashboard />
            </RoleBaseRoutes>

          </PrivateRoutes>


        }>
          <Route index element={<AdminSummary />}></Route>
          <Route path='/admin-dashboard/departments' element={<DepartmentList />}></Route>
          <Route path='/admin-dashboard/add-department' element={<AddDepartment />}></Route>
          <Route path="/admin-dashboard/department/:id" element={<EditDepartment />}></Route>


          <Route path="/admin-dashboard/employees" element={<List />}></Route>
          <Route path="/admin-dashboard/add-employee" element={<Add />}></Route>
          <Route path="/admin-dashboard/employees/:id" element={<View />}></Route>
          <Route path="/admin-dashboard/employees/edit/:id" element={<Edit />}></Route>
          <Route path="/admin-dashboard/employees/salary/:id" element={<ViewSalary />}></Route>


          <Route path="/admin-dashboard/salary/add" element={<AddSalary />}></Route>
          <Route path="/admin-dashboard/leaves" element={<Table/>}></Route>
          <Route path="/admin-dashboard/leaves/:id" element={<Detail/>}></Route>
          <Route path="/admin-dashboard/employees/leaves/:id" element={<LeaveList/>}></Route>
          <Route path="/admin-dashboard/attendance" element={<AttendanceList />}></Route>
          <Route path="/admin-dashboard/reports" element={<Reports />}></Route>
          <Route path="/admin-dashboard/setting" element={<Setting/>}></Route>
          <Route path="/admin-dashboard/announcements" element={<AnnouncementList />}></Route>
          <Route path="/admin-dashboard/support" element={<SupportChat />}></Route>
          <Route path="/admin-dashboard/subscription" element={<ManageSubscription />}></Route>


        </Route>
        <Route
          path="/employee-dashboard"
          element={
            <PrivateRoutes>
              <RoleBaseRoutes requiredRole={["admin", "employee"]}>
                <EmployeeDashboard />
              </RoleBaseRoutes>
            </PrivateRoutes>
          }
        >
          <Route index element={<Summary/>}></Route>
          <Route path="/employee-dashboard/profile/:id" element={<View/>}></Route>
          <Route path="/employee-dashboard/leaves/" element={<LeaveList/>}></Route>
          <Route path="/employee-dashboard/add-leave" element={<AddLeave/>}></Route>
          <Route path="/employee-dashboard/salary/:id" element={<ViewSalary/>}></Route>
          <Route path="/employee-dashboard/setting" element={<Setting/>}></Route>
          <Route path="/employee-dashboard/announcements" element={<AnnouncementList />}></Route>
        </Route>

        <Route path="/superadmin-dashboard" element={
          <PrivateRoutes>
            <RoleBaseRoutes requiredRole={["superadmin"]}>
              <SuperAdminDashboard />
            </RoleBaseRoutes>
          </PrivateRoutes>
        }>
          <Route index element={<CompanyList />}></Route>
          <Route path="/superadmin-dashboard/add-company" element={<AddCompany />}></Route>
          <Route path="/superadmin-dashboard/support" element={<SupportTickets />}></Route>
          <Route path="/superadmin-dashboard/landing-inquiries" element={<LandingInquiries />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App