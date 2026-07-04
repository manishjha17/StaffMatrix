import multer from "multer"
import Employee from "../models/Employee.js"
import User from "../models/User.js"
import bcrypt from 'bcrypt'
import path from "path"
import Department from '../models/Department.js'
import Salary from "../models/Salary.js"
import Leave from "../models/Leave.js"
import Attendance from "../models/Attendance.js"

import { storage } from "../config/cloudinary.js"

const upload = multer({ storage: storage })

const addEmployee = async (req, res) => {
    try {
        const {
            name,
            email,
            employeeId,
            dob,
            gender,
            maritalStatus,
            designation,
            department,
            salary,
            password,
            role,
        } = req.body;

        if (req.user.subscriptionPlan === 'basic') {
            const employeeCount = await Employee.countDocuments({ companyId: req.user.companyId });
            if (employeeCount >= 10) {
                return res.status(403).json({ success: false, error: "Basic plan allows up to 10 employees. Please upgrade your plan." });
            }
        }

        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ success: false, error: "user already registered in emp" });
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            companyId: req.user.companyId,
            name,
            email,
            password: hashPassword,
            role,
            profileImage: req.file ? req.file.path : ""
        })

        const savedUser = await newUser.save()

        const newEmployee = new Employee({
            companyId: req.user.companyId,
            userId: savedUser._id,
            employeeId,
            dob,
            gender,
            maritalStatus,
            designation,
            department,
            salary
        })

        await newEmployee.save()
        return res.status(200).json({success:true,message:"employee created"})
    }catch(error){
        return res.status(500).json({success:false ,error:"server error in adding employee "})
    }

}

const getEmployees=async (req,res)=>{
    try{
        const employees=await Employee.find({ companyId: req.user.companyId }).populate('userId',{password:0}).populate('department')
        return res.status(200).json({success:true,employees})
    }catch(error){
        return res.status(500).json({success:false,error:"get employees server error"})
    }
}

const getEmployee=async (req,res)=>{
    const {id}=req.params;
    try{
         let employee;
         employee=await Employee.findOne({_id:id, companyId: req.user.companyId}).populate('userId',{password:0}).populate('department')
        if(!employee){
           employee= await Employee.findOne({userId:id, companyId: req.user.companyId}).populate('userId',{password:0}).populate('department')
        }
        return res.status(200).json({success:true,employee})
    }catch(error){
        return res.status(500).json({success:false,error:"get employees server error"})
    }
}

const updateEmployee=async(req,res)=>{
    try{
        const {id}=req.params;
        const {
            name,
            maritalStatus,
            designation,
            department,
            salary,
            performanceRating,
            performanceNote,
        } = req.body;

        const employee=await Employee.findOne({_id:id, companyId: req.user.companyId})
        if(!employee){
          return res
          .status(404)
          .json({success:false,error:"employee not found"})
        }
        const user=await User.findById({_id: employee.userId})

        if(!user){
          return res
          .status(404)
          .json({success:false,error:"user not found"})
        }

        // Only allow pro plan to update performance
        if ((performanceRating || performanceNote) && req.user.subscriptionPlan !== 'pro') {
             return res.status(403).json({ success: false, error: "Performance Ratings are only available on the Pro Plan." });
        }

        const userUpdateData = { name };
        if (req.file) {
            userUpdateData.profileImage = req.file.path;
        }
        const updateUser=await User.findByIdAndUpdate({_id:employee.userId}, userUpdateData)
        const updateEmployee=await Employee.findByIdAndUpdate({_id:id},{
            maritalStatus,
            designation,
            salary,
            department,
            ...(req.user.subscriptionPlan === 'pro' && { performanceRating, performanceNote })
        })

        if(!updateEmployee || !updateUser){
          return res
          .status(404)
          .json({success:false,error:"document not found"});
        }

        return res.status(200).json({success:true,message:"employee update"})

    }catch(error){
        return res.status(500).json({success:false,error:"update employees server error"})
    }
}

const fetchEmployeesByDepId=async (req,res)=>{
     const {id}=req.params;
    try{
        const employees=await Employee.find({department:id, companyId: req.user.companyId})
        return res.status(200).json({success:true,employees})
    }catch(error){
        return res.status(500).json({success:false,error:"get employeesbyDepId server error"})
    }
}

const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findOne({ _id: id, companyId: req.user.companyId });
        if (!employee) {
            return res.status(404).json({ success: false, error: "Employee not found" });
        }

        // Delete all associated data
        await User.findByIdAndDelete(employee.userId);
        await Leave.deleteMany({ employeeId: employee._id, companyId: req.user.companyId });
        await Salary.deleteMany({ employeeId: employee._id, companyId: req.user.companyId });
        await Attendance.deleteMany({ userId: employee.userId, companyId: req.user.companyId });
        
        // Delete the employee
        await Employee.findByIdAndDelete(id);

        return res.status(200).json({ success: true, message: "Employee and all related data deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Delete employee server error" });
    }
}

export { addEmployee, upload ,getEmployees, getEmployee,updateEmployee,fetchEmployeesByDepId, deleteEmployee }