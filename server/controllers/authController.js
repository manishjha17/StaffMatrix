import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';;

const login=async (req,res)=>{
    try{
        const {email,password,role}=req.body;
        let query = { email };
        if (role) {
            if (role === 'admin') {
                query.role = { $in: ['admin', 'superadmin'] };
            } else {
                query.role = 'employee';
            }
        }
        const user=await User.findOne(query)
        if(!user){
            return res.status(404).json({success:false,error:"User Not Found"})
        }

        const isMatch=await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(404).json({success:false,error:"Wrong Password"})
        }
        if (user.role === 'admin') {
            const Company = (await import('../models/Company.js')).default;
            const company = await Company.findById(user.companyId);
            if (!company) {
                return res.status(404).json({ success: false, error: "Associated company not found." });
            }
            if (company.status === 'pending') {
                return res.status(403).json({ success: false, error: "Your company is currently under verification by the Superadmin. Please wait for approval." });
            }
            if (company.status === 'rejected') {
                return res.status(403).json({ success: false, error: "Your company registration was rejected. Please contact support." });
            }
        }

        let subscriptionPlan = 'pro'; // default to pro for superadmin or backward compat
        if (user.role === 'admin' || user.role === 'employee') {
            const Company = (await import('../models/Company.js')).default;
            const company = await Company.findById(user.companyId);
            if (company) {
                subscriptionPlan = company.subscriptionPlan;
            }
        }

        const token=jwt.sign({_id:user._id,role:user.role, companyId: user.companyId},
            process.env.JWT_KEY, {expiresIn: "10d"}
        )
        res.status(200).json({success:true,token,user:{_id:user._id,name:user.name, role:user.role, companyId: user.companyId, subscriptionPlan, profileImage: user.profileImage}});
    }catch(error){
        res.status(500).json({success:false,error:error.message})
    }
};

const verify=(req,res)=>{
    return res.status(200).json({success:true, user:req.user})
}

export {login,verify}