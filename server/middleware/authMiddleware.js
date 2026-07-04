import jwt from 'jsonwebtoken'
import { request } from "express";
import User from '../models/User.js';

const verifyUser=async (req, res,next)=>{
    try{
        const token=req.headers.authorization.split(' ')[1];
        if(!token){
            return res.status(404).json({success:false, error:"Token Not Provided"})
        }

        const decoded= jwt.verify(token,process.env.JWT_KEY)
        if(!decoded){
            return res.status(404).json({success:false,error:"Token Not Valid"})
        }

        const user=await User.findById({_id:decoded._id}).select('-password')

        if(!user){
            return res.status(404).json({success:false,error:"User not found"})
        }
        let subscriptionPlan = 'pro';
        if (user.role === 'admin' || user.role === 'employee') {
            const Company = (await import('../models/Company.js')).default;
            const company = await Company.findById(user.companyId);
            if (company) {
                subscriptionPlan = company.subscriptionPlan;
            }
        }
        
        req.user = { ...user.toObject(), subscriptionPlan };

        next()
    } catch(error) {
        console.error("authMiddleware error:", error);
        return res.status(500).json({success:false, error:"server error", details: error.message})
    }
}

const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: "Unauthorized access" });
        }
        next();
    };
};

export default verifyUser;
export { authorizeRole };